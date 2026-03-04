import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import logger from "@/lib/logger";
import { CustomFile, EstadoArchivo, PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
const fileStorage = new S3FileStorageAdapter();
const isDev = process.env.NODE_ENV !== "production";

// ============================================================================
// FUNCIONES DE PROCESAMIENTO INDIVIDUAL
// ============================================================================

/**
 * Procesa un archivo individual para borrar.
 * - Si finalPath está en /tmp, solo marca como Borrado (no elimina de S3)
 * - Si finalPath NO está en /tmp, elimina de S3 y marca como Borrado
 * - En caso de error, marca como ErrorAlBorrar
 */
async function procesarUnArchivoParaBorrar(archivo: CustomFile): Promise<void> {
  try {
    const pathToCheck = archivo.finalPath;
    const isInTmp = pathToCheck?.includes("/tmp/") || false;

    // Determinar el motivo (todas las FKs nulas = desreferenciado)
    const esDesreferenciado =
      archivo.ordenReparacionId === null &&
      archivo.reciboORepId === null &&
      archivo.reparacionDeTerceroId === null &&
      archivo.presupuestoCedulaId === null &&
      archivo.ventaCedulaId === null &&
      archivo.empleadoLicenciaConducirId === null &&
      archivo.empleadoInscripcionMonotributoId === null &&
      archivo.empleadoRecategorizacionMonotributoId === null &&
      archivo.empleadoCurriculumId === null;
    const motivo = esDesreferenciado ? "desref" : "ListoParaBorrar";

    let accion = "";

    if (!pathToCheck) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: { status: EstadoArchivo.Borrado },
        });
      }
      accion = "sin path → Borrado";
    } else if (isInTmp) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: { status: EstadoArchivo.Borrado },
        });
      }
      accion = "en /tmp → Borrado (S3 intacto)";
    } else {
      let s3Nota = "";
      if (!isDev) {
        try {
          await fileStorage.removeFile(pathToCheck);
        } catch (s3Error) {
          const errorMsg =
            s3Error instanceof Error ? s3Error.message : "Error desconocido";
          if (
            errorMsg.includes("does not exist") ||
            errorMsg.includes("NoSuchKey")
          ) {
            s3Nota = " (no existía en S3)";
          } else {
            throw s3Error;
          }
        }
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: { status: EstadoArchivo.Borrado },
        });
      }
      accion = `S3 eliminado${s3Nota} → Borrado`;
    }

    const dev = isDev ? " [SIMULADO]" : "";
    logger.info(`[S3FileSync] ID ${archivo.id} | ${motivo} | ${accion}${dev}`);
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error desconocido";

    if (!isDev) {
      await prisma.customFile.update({
        where: { id: archivo.id },
        data: { status: EstadoArchivo.ErrorAlBorrar },
      });
    }

    logger.error(
      `[S3FileSync] ID ${archivo.id} | ERROR: ${errorMsg} → ErrorAlBorrar`
    );
  }
}

/**
 * Procesa un archivo individual pendiente (subir de /tmp a carpeta final).
 * - Si tiene finalPath → marca como Listo
 * - Si no tiene finalPath → mueve de /tmp a carpeta destino y marca como Listo
 * - En caso de error, marca como ErrorAlSubir
 */
async function procesarUnArchivoPending(archivo: CustomFile): Promise<void> {
  try {
    const folder = archivo.ordenReparacionId ? "scanner" : "recibos";
    const dev = isDev ? " [SIMULADO]" : "";

    // 1. Si ya tiene finalPath, solo marcar como Listo
    if (archivo.finalPath) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.Listo,
            promotedAt: new Date(),
          },
        });
      }
      logger.info(
        `[S3FileSync] ID ${archivo.id} | ya tiene finalPath → Listo${dev}`
      );
      return;
    }

    // 2. Si no tiene tempPath ni finalPath, es un error
    if (!archivo.tempPath) {
      if (!isDev) {
        await prisma.customFile.update({
          where: { id: archivo.id },
          data: {
            status: EstadoArchivo.ErrorAlSubir,
            promotedAt: new Date(),
          },
        });
      }
      logger.warn(
        `[S3FileSync] ID ${archivo.id} | sin tempPath ni finalPath → ErrorAlSubir`
      );
      return;
    }

    // 3. Mover archivo de /tmp a carpeta destino
    if (!isDev) {
      const finalPath = await fileStorage.moveTempTo(archivo.tempPath, folder);

      await prisma.customFile.update({
        where: { id: archivo.id },
        data: {
          finalPath,
          status: EstadoArchivo.Listo,
          promotedAt: new Date(),
        },
      });
    }

    logger.info(
      `[S3FileSync] ID ${archivo.id} | movido de /tmp a /${folder} → Listo${dev}`
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error desconocido";

    if (!isDev) {
      await prisma.customFile.update({
        where: { id: archivo.id },
        data: {
          status: EstadoArchivo.ErrorAlSubir,
          promotedAt: new Date(),
        },
      });
    }

    logger.error(
      `[S3FileSync] ID ${archivo.id} | ERROR: ${errorMsg} → ErrorAlSubir`
    );
  }
}

// ============================================================================
// FUNCIONES DE PROCESAMIENTO EN LOTE
// ============================================================================

/**
 * Procesa archivos desreferenciados o marcados como ListoParaBorrar.
 */
async function procesarArchivosParaBorrar() {
  logger.info(
    "[S3FileSync] Iniciando procesamiento de archivos para borrar (desreferenciados o ListoParaBorrar)"
  );

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
          status: { not: EstadoArchivo.Borrado },
        },
        {
          status: EstadoArchivo.ListoParaBorrar,
        },
      ],
    },
  });

  logger.info(
    `[S3FileSync] Archivos para borrar encontrados: ${archivosParaBorrar.length}`
  );

  for (const archivo of archivosParaBorrar) {
    await procesarUnArchivoParaBorrar(archivo);
  }
}

/**
 * Procesa archivos con estado Pending.
 */
async function procesarArchivosPending() {
  logger.info(
    "[S3FileSync] Iniciando procesamiento de archivos con estado Pending"
  );

  const archivosPending = await prisma.customFile.findMany({
    where: {
      status: EstadoArchivo.Pendiente,
    },
  });

  logger.info(
    `[S3FileSync] Archivos Pending encontrados: ${archivosPending.length}`
  );

  for (const archivo of archivosPending) {
    await procesarUnArchivoPending(archivo);
  }
}

/**
 * Reintenta subir archivos que fallaron anteriormente (estado ErrorAlSubir).
 */
async function procesarErroresAlSubir() {
  logger.info(
    "[S3FileSync] Iniciando reprocesamiento de archivos con estado ErrorAlSubir"
  );

  const archivosConError = await prisma.customFile.findMany({
    where: {
      status: EstadoArchivo.ErrorAlSubir,
    },
  });

  logger.info(
    `[S3FileSync] Archivos ErrorAlSubir encontrados: ${archivosConError.length}`
  );

  for (const archivo of archivosConError) {
    await procesarUnArchivoPending(archivo);
  }
}

/**
 * Reintenta borrar archivos que fallaron anteriormente (estado ErrorAlBorrar).
 */
async function procesarErroresAlBorrar() {
  logger.info(
    "[S3FileSync] Iniciando reprocesamiento de archivos con estado ErrorAlBorrar"
  );

  const archivosConError = await prisma.customFile.findMany({
    where: {
      status: EstadoArchivo.ErrorAlBorrar,
    },
  });

  logger.info(
    `[S3FileSync] Archivos ErrorAlBorrar encontrados: ${archivosConError.length}`
  );

  for (const archivo of archivosConError) {
    await procesarUnArchivoParaBorrar(archivo);
  }
}

// ============================================================================
// ORQUESTACIÓN Y CRON
// ============================================================================

/**
 * Ejecuta todas las tareas de sincronización de archivos
 */
async function sincronizarArchivos() {
  logger.info(
    "[S3FileSync] ========== INICIANDO SINCRONIZACIÓN DE ARCHIVOS S3 =========="
  );

  try {
    await procesarArchivosParaBorrar();
    await procesarArchivosPending();
    await procesarErroresAlSubir();
    await procesarErroresAlBorrar();

    logger.info(
      "[S3FileSync] ========== SINCRONIZACIÓN DE ARCHIVOS S3 COMPLETADA =========="
    );
  } catch (error) {
    logger.error(
      `[S3FileSync] Error crítico durante la sincronización: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Inicializa el cron job para sincronización de archivos S3
 */
export function initS3FileSyncCron() {
  cron.schedule("0 3 * * *", sincronizarArchivos, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  });

  logger.info(
    "[S3FileSync] Cron job para sincronización de archivos S3 iniciado - Ejecuta diariamente a las 3:00 AM"
  );
}

// Ejecutar inmediatamente al iniciar la aplicación (opcional)
// sincronizarArchivos();
