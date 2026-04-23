import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import logger from "@/lib/logger";
import { CustomFile, EstadoArchivo, PrismaClient } from "@prisma/client";
import { createWriteStream, WriteStream } from "fs";
import { mkdir, readdir, stat, unlink } from "fs/promises";
import os from "os";
import path from "path";
import cron from "node-cron";

const prisma = new PrismaClient();
const fileStorage = new S3FileStorageAdapter();
const isDev = process.env.NODE_ENV !== "production";

const LOG_DIR = path.join(process.cwd(), "logs", "s3-sync");
const LOG_RETENTION_DAYS = 30;

// ============================================================================
// LOG POR CORRIDA (archivo .log dedicado)
// ============================================================================

type RunAction =
  | "Promovido"
  | "Saltado"
  | "Borrado"
  | "ErrorAlSubir"
  | "ErrorAlBorrar"
  | "Error";

interface RunCounters {
  procesados: number;
  promovidos: number;
  fallidos: number;
  borrados: number;
}

interface RunContext {
  stream: WriteStream | null;
  filePath: string | null;
  startedAt: number;
  counters: RunCounters;
}

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fileStamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function openRunLog(): Promise<RunContext> {
  const ctx: RunContext = {
    stream: null,
    filePath: null,
    startedAt: Date.now(),
    counters: { procesados: 0, promovidos: 0, fallidos: 0, borrados: 0 },
  };

  try {
    await mkdir(LOG_DIR, { recursive: true });
    const filePath = path.join(LOG_DIR, `s3FileSync-${fileStamp()}.log`);
    const stream = createWriteStream(filePath, { flags: "a" });
    stream.write(
      `=== INICIO s3FileSync [${nowStamp()}] host=${os.hostname()} pid=${process.pid}${isDev ? " (DEV SIMULADO)" : ""} ===\n`
    );
    ctx.stream = stream;
    ctx.filePath = filePath;
  } catch (error: any) {
    logger.error("[S3FileSync] No se pudo abrir el log de la corrida", {
      message: error?.message,
    });
  }

  return ctx;
}

function closeRunLog(ctx: RunContext, success: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (!ctx.stream) {
      resolve();
      return;
    }
    const durationMs = Date.now() - ctx.startedAt;
    ctx.stream.write(
      `=== FIN [${nowStamp()}] | procesados=${ctx.counters.procesados} promovidos=${ctx.counters.promovidos} fallidos=${ctx.counters.fallidos} borrados=${ctx.counters.borrados} duración=${(durationMs / 1000).toFixed(1)}s success=${success} ===\n`
    );
    ctx.stream.end(() => resolve());
  });
}

function writeItem(
  ctx: RunContext,
  file: CustomFile,
  action: RunAction,
  message: string,
  durationMs?: number
) {
  const line = `[${nowStamp()}] CustomFile #${file.id} (OdR ${file.ordenReparacionId ?? file.reciboORepId ?? "null"}) action=${action} | ${message}${durationMs != null ? ` (${durationMs}ms)` : ""}\n`;

  if (ctx.stream) {
    ctx.stream.write(line);
  }

  ctx.counters.procesados += 1;
  if (action === "Promovido") ctx.counters.promovidos += 1;
  if (action === "Borrado") ctx.counters.borrados += 1;
  if (action === "ErrorAlSubir" || action === "ErrorAlBorrar" || action === "Error") {
    ctx.counters.fallidos += 1;
  }
}

async function limpiarLogsAntiguos(): Promise<void> {
  try {
    const entries = await readdir(LOG_DIR);
    const cutoff = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let borrados = 0;

    for (const entry of entries) {
      const fullPath = path.join(LOG_DIR, entry);
      try {
        const st = await stat(fullPath);
        if (st.isFile() && st.mtimeMs < cutoff) {
          await unlink(fullPath);
          borrados += 1;
        }
      } catch {
        // ignorar un archivo roto aislado
      }
    }

    if (borrados > 0) {
      logger.info(`[S3FileSync] Limpieza de logs viejos: ${borrados} archivos borrados (>${LOG_RETENTION_DAYS}d)`);
    }
  } catch (error: any) {
    // Primera corrida: la carpeta puede no existir aún, no es error.
    if (error?.code !== "ENOENT") {
      logger.warn("[S3FileSync] Falló la limpieza de logs viejos", {
        message: error?.message,
      });
    }
  }
}

function classifyAwsError(error: any): { code: string; message: string; isNoSuchKey: boolean } {
  const message = error?.message ?? "Error desconocido";
  const code = error?.Code ?? error?.name ?? "Unknown";
  const isNoSuchKey =
    code === "NoSuchKey" ||
    error?.name === "NoSuchKey" ||
    (typeof message === "string" && message.includes("does not exist"));
  return { code, message, isNoSuchKey };
}

// ============================================================================
// FUNCIONES DE PROCESAMIENTO INDIVIDUAL
// ============================================================================

async function procesarUnArchivoParaBorrar(archivo: CustomFile, ctx: RunContext): Promise<void> {
  const itemStart = Date.now();
  try {
    const pathToCheck = archivo.finalPath;
    const isInTmp = pathToCheck?.includes("/tmp/") || false;

    const esDesreferenciado =
      archivo.ordenReparacionId === null &&
      archivo.reciboORepId === null &&
      archivo.reparacionDeTerceroId === null &&
      archivo.presupuestoCedulaId === null &&
      archivo.ventaCedulaId === null &&
      archivo.empleadoLicenciaConducirId === null &&
      archivo.empleadoInscripcionMonotributoId === null &&
      archivo.empleadoRecategorizacionMonotributoId === null &&
      archivo.empleadoCurriculumId === null &&
      archivo.empleadoCredencialPagoId === null &&
      archivo.empleadoDniFrenteId === null &&
      archivo.empleadoDniDorsoId === null &&
      archivo.llegadaTardeCertificadoId === null &&
      archivo.inasistenciaCertificadoId === null &&
      archivo.certificadoEstudioRutaId === null &&
      archivo.documentoGeneralId === null &&
      archivo.autoCedulaVerdeId === null;
    const motivo = esDesreferenciado ? "desreferenciado" : "ListoParaBorrar";

    let msg = "";

    if (!pathToCheck) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Borrado,
            errorMessage: null,
            lastErrorAt: null,
          },
        });
      }
      msg = `${motivo} sin path → Borrado`;
    } else if (isInTmp) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Borrado,
            errorMessage: null,
            lastErrorAt: null,
          },
        });
      }
      msg = `${motivo} en tmp/ → Borrado (S3 intacto, caducará por TTL)`;
    } else {
      let s3Nota = "";
      if (!isDev) {
        try {
          await fileStorage.removeFile(pathToCheck);
        } catch (s3Error: any) {
          const { code, message } = classifyAwsError(s3Error);
          if (code === "NoSuchKey" || message.includes("does not exist")) {
            s3Nota = " (no existía en S3)";
          } else {
            throw s3Error;
          }
        }
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Borrado,
            errorMessage: null,
            lastErrorAt: null,
          },
        });
      }
      msg = `${motivo} → S3 eliminado${s3Nota} → Borrado`;
    }

    const dev = isDev ? " [SIMULADO]" : "";
    writeItem(ctx, archivo, "Borrado", `${msg}${dev}`, Date.now() - itemStart);
    logger.info("[S3FileSync] borrado", {
      fileId: archivo.id,
      ordenReparacionId: archivo.ordenReparacionId,
      reciboORepId: archivo.reciboORepId,
      finalPath: archivo.finalPath,
      motivo,
      simulado: isDev,
    });
  } catch (error: any) {
    const { code, message } = classifyAwsError(error);
    if (!isDev) {
      await prisma.customFile.update({
        where: { id: archivo.id },
        data: {
          status: EstadoArchivo.ErrorAlBorrar,
          errorMessage: `${code}: ${message}`,
          lastErrorAt: new Date(),
        },
      });
    }
    writeItem(
      ctx,
      archivo,
      "ErrorAlBorrar",
      `ERROR ${code}: ${message} → ErrorAlBorrar`,
      Date.now() - itemStart
    );
    logger.error("[S3FileSync] error al borrar", {
      fileId: archivo.id,
      finalPath: archivo.finalPath,
      errorCode: code,
      errorMessage: message,
    });
  }
}

async function procesarUnArchivoPending(archivo: CustomFile, ctx: RunContext): Promise<void> {
  const itemStart = Date.now();

  try {
    const folder = archivo.ordenReparacionId
      ? "scanner"
      : archivo.reciboORepId
        ? "recibos"
        : archivo.reparacionDeTerceroId
          ? "recibos-terceros"
          : archivo.presupuestoCedulaId ||
              archivo.ventaCedulaId ||
              archivo.autoCedulaVerdeId
            ? "cedula-verde"
            : archivo.empleadoLicenciaConducirId
              ? "licencias-conducir"
              : archivo.empleadoInscripcionMonotributoId ||
                  archivo.empleadoRecategorizacionMonotributoId
                ? "monotributo"
                : archivo.empleadoCurriculumId
                  ? "curriculum"
                  : archivo.empleadoCredencialPagoId
                    ? "credenciales-pago"
                    : archivo.empleadoDniFrenteId || archivo.empleadoDniDorsoId
                      ? "dni"
                      : archivo.llegadaTardeCertificadoId
                        ? "certificados-llegada-tarde"
                        : archivo.inasistenciaCertificadoId
                          ? "certificados-inasistencia"
                          : archivo.certificadoEstudioRutaId
                            ? "certificados-estudio"
                            : archivo.documentoGeneralId
                              ? "documentacion"
                              : "otros";
    const dev = isDev ? " [SIMULADO]" : "";

    if (archivo.finalPath) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Listo,
            promotedAt: new Date(),
            errorMessage: null,
            lastErrorAt: null,
          },
        });
      }
      writeItem(
        ctx,
        archivo,
        "Saltado",
        `ya tenía finalPath → Listo${dev}`,
        Date.now() - itemStart
      );
      return;
    }

    if (!archivo.tempPath) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Error,
            errorMessage: "sin tempPath ni finalPath",
            lastErrorAt: new Date(),
          },
        });
      }
      writeItem(
        ctx,
        archivo,
        "Error",
        `sin tempPath ni finalPath → Error (terminal)${dev}`,
        Date.now() - itemStart
      );
      logger.warn("[S3FileSync] archivo sin tempPath ni finalPath", {
        fileId: archivo.id,
      });
      return;
    }

    if (!isDev) {
      const finalPath = await fileStorage.moveTempTo(archivo.tempPath, folder);

      await prisma.customFile.update({
        where: { id: archivo.id },
        data: {
          finalPath,
          status: EstadoArchivo.Listo,
          promotedAt: new Date(),
          errorMessage: null,
          lastErrorAt: null,
        },
      });
    }

    writeItem(
      ctx,
      archivo,
      "Promovido",
      `movido tmp → ${folder}/${dev}`,
      Date.now() - itemStart
    );
    logger.info("[S3FileSync] promovido", {
      fileId: archivo.id,
      ordenReparacionId: archivo.ordenReparacionId,
      reciboORepId: archivo.reciboORepId,
      tempPath: archivo.tempPath,
      folder,
      simulado: isDev,
    });
  } catch (error: any) {
    const { code, message, isNoSuchKey } = classifyAwsError(error);

    const nextStatus = isNoSuchKey ? EstadoArchivo.Error : EstadoArchivo.ErrorAlSubir;
    const action: RunAction = isNoSuchKey ? "Error" : "ErrorAlSubir";
    const explicacion = isNoSuchKey
      ? `NoSuchKey: source tmp ya no existe en S3 (caducó o nunca se subió) → Error (terminal, no se reintenta)`
      : `${code}: ${message} → ErrorAlSubir (se reintentará en la próxima corrida)`;

    if (!isDev) {
      await prisma.customFile.update({
        where: { id: archivo.id },
        data: {
          status: nextStatus,
          errorMessage: `${code}: ${message}`,
          lastErrorAt: new Date(),
        },
      });
    }

    writeItem(ctx, archivo, action, explicacion, Date.now() - itemStart);
    logger.error("[S3FileSync] error al promover", {
      fileId: archivo.id,
      ordenReparacionId: archivo.ordenReparacionId,
      reciboORepId: archivo.reciboORepId,
      tempPath: archivo.tempPath,
      errorCode: code,
      errorMessage: message,
      isNoSuchKey,
      nextStatus,
    });
  }
}

// ============================================================================
// FUNCIONES DE PROCESAMIENTO EN LOTE
// ============================================================================

async function procesarArchivosParaBorrar(ctx: RunContext) {
  logger.info("[S3FileSync] Iniciando procesamiento de archivos para borrar");

  const archivosParaBorrar = await prisma.customFile.findMany({
    where: {
      OR: [
        {
          ordenReparacionId: null,
          reciboORepId: null,
          reparacionDeTerceroId: null,
          presupuestoCedulaId: null,
          ventaCedulaId: null,
          empleadoLicenciaConducirId: null,
          empleadoInscripcionMonotributoId: null,
          empleadoRecategorizacionMonotributoId: null,
          empleadoCurriculumId: null,
          empleadoCredencialPagoId: null,
          empleadoDniFrenteId: null,
          empleadoDniDorsoId: null,
          llegadaTardeCertificadoId: null,
          inasistenciaCertificadoId: null,
          certificadoEstudioRutaId: null,
          documentoGeneralId: null,
          autoCedulaVerdeId: null,
          status: { not: EstadoArchivo.Borrado },
        },
        { status: EstadoArchivo.ListoParaBorrar },
      ],
    },
  });

  logger.info(`[S3FileSync] Archivos para borrar: ${archivosParaBorrar.length}`);

  for (const archivo of archivosParaBorrar) {
    await procesarUnArchivoParaBorrar(archivo, ctx);
  }
}

async function procesarArchivosPending(ctx: RunContext) {
  logger.info("[S3FileSync] Iniciando procesamiento de Pendientes");

  const archivosPending = await prisma.customFile.findMany({
    where: { status: EstadoArchivo.Pendiente },
  });

  logger.info(`[S3FileSync] Pendientes: ${archivosPending.length}`);

  for (const archivo of archivosPending) {
    await procesarUnArchivoPending(archivo, ctx);
  }
}

async function procesarErroresAlBorrar(ctx: RunContext) {
  logger.info("[S3FileSync] Reintentando ErrorAlBorrar");

  const archivosConError = await prisma.customFile.findMany({
    where: { status: EstadoArchivo.ErrorAlBorrar },
  });

  logger.info(`[S3FileSync] ErrorAlBorrar: ${archivosConError.length}`);

  for (const archivo of archivosConError) {
    await procesarUnArchivoParaBorrar(archivo, ctx);
  }
}

async function procesarErroresAlSubir(ctx: RunContext) {
  logger.info("[S3FileSync] Reintentando ErrorAlSubir");

  const archivosConError = await prisma.customFile.findMany({
    where: { status: EstadoArchivo.ErrorAlSubir },
  });

  logger.info(`[S3FileSync] ErrorAlSubir: ${archivosConError.length}`);

  for (const archivo of archivosConError) {
    await procesarUnArchivoPending(archivo, ctx);
  }
}

// ============================================================================
// ORQUESTACIÓN Y CRON
// ============================================================================

let lastRunAt: number | null = null;
let running = false;

async function sincronizarArchivos() {
  if (running) {
    logger.warn("[S3FileSync] Ya hay una corrida en ejecución, se saltea este tick");
    return;
  }
  running = true;

  await limpiarLogsAntiguos();

  const ctx = await openRunLog();
  let success = false;

  logger.info("[S3FileSync] ========== INICIO sincronización ==========");

  try {
    await procesarArchivosParaBorrar(ctx);
    await procesarArchivosPending(ctx);
    await procesarErroresAlSubir(ctx);
    await procesarErroresAlBorrar(ctx);

    success = true;
    logger.info("[S3FileSync] ========== FIN sincronización OK ==========", {
      ...ctx.counters,
      logFile: ctx.filePath,
    });
  } catch (error: any) {
    logger.error("[S3FileSync] Error crítico durante la sincronización", {
      message: error?.message,
      logFile: ctx.filePath,
    });
  } finally {
    await closeRunLog(ctx, success);
    lastRunAt = Date.now();
    running = false;
  }
}

export function initS3FileSyncCron() {
  cron.schedule("0 */6 * * *", sincronizarArchivos, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  });

  logger.info(
    "[S3FileSync] Cron S3 programado cada 6 horas (America/Argentina/Buenos_Aires)"
  );

  // Boot-time catchup: si al levantar el proceso no corrimos aún en esta instancia,
  // disparar una sincronización 60s después del startup. Cubre reinicios que caen
  // fuera de la ventana de ejecución del cron.
  setTimeout(() => {
    if (lastRunAt === null) {
      logger.info("[S3FileSync] Boot-time catchup: disparando sincronización inicial");
      sincronizarArchivos().catch((err) => {
        logger.error("[S3FileSync] Error en boot-time catchup", {
          message: err?.message,
        });
      });
    }
  }, 60 * 1000);
}
