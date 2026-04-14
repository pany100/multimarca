import { PrismaRecordatorioManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-recordatorio-mano-de-obra.repository";
import logger from "@/lib/logger";
import { sendWhatsAppMessage } from "@/services/notificaciones-whataspp-old";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createWriteStream, WriteStream } from "fs";
import { mkdir, readdir, stat, unlink } from "fs/promises";
import cron from "node-cron";
import os from "os";
import path from "path";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const LOG_DIR = path.join(
  process.cwd(),
  "logs",
  "recordatorios-mano-de-obra"
);
const LOG_RETENTION_DAYS = 30;

// ============================================================================
// LOG POR CORRIDA (archivo .log dedicado)
// ============================================================================

type RunDecision =
  | "ENVIADO"
  | "OMITIDO_FUERA_DE_FECHA"
  | "ERROR_AL_ENVIAR";

interface RunCounters {
  evaluados: number;
  enviados: number;
  omitidos_fuera_de_fecha: number;
  fallidos: number;
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

async function openRunLog(fechaHoy: string): Promise<RunContext> {
  const ctx: RunContext = {
    stream: null,
    filePath: null,
    startedAt: Date.now(),
    counters: {
      evaluados: 0,
      enviados: 0,
      omitidos_fuera_de_fecha: 0,
      fallidos: 0,
    },
  };

  try {
    await mkdir(LOG_DIR, { recursive: true });
    const filePath = path.join(
      LOG_DIR,
      `recordatoriosManoDeObra-${fileStamp()}.log`
    );
    const stream = createWriteStream(filePath, { flags: "a" });
    stream.write(
      `=== INICIO recordatoriosManoDeObra [${nowStamp()}] host=${os.hostname()} pid=${process.pid} fechaHoy=${fechaHoy} ===\n`
    );
    ctx.stream = stream;
    ctx.filePath = filePath;
  } catch (error: any) {
    logger.error(
      "[RecordatoriosManoDeObra] No se pudo abrir el log de la corrida",
      { message: error?.message }
    );
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
      `=== FIN [${nowStamp()}] | evaluados=${ctx.counters.evaluados} enviados=${ctx.counters.enviados} omitidos_fuera_de_fecha=${ctx.counters.omitidos_fuera_de_fecha} fallidos=${ctx.counters.fallidos} duración=${(durationMs / 1000).toFixed(1)}s success=${success} ===\n`
    );
    ctx.stream.end(() => resolve());
  });
}

function writeItem(
  ctx: RunContext,
  info: {
    fullName: string;
    phone: string;
    patent: string;
    descripcion: string;
    fechaSalida: string;
    diaRecordatorio: number | null;
  },
  decision: RunDecision,
  detalle: string,
  durationMs?: number
) {
  const line = `[${nowStamp()}] cliente="${info.fullName}" phone=${info.phone} patent=${info.patent} trabajo="${info.descripcion}" fechaSalida=${info.fechaSalida} diaRecordatorio=${info.diaRecordatorio ?? "-"} decision=${decision} | ${detalle}${durationMs != null ? ` (${durationMs}ms)` : ""}\n`;

  if (ctx.stream) {
    ctx.stream.write(line);
  }

  ctx.counters.evaluados += 1;
  if (decision === "ENVIADO") ctx.counters.enviados += 1;
  if (decision === "OMITIDO_FUERA_DE_FECHA")
    ctx.counters.omitidos_fuera_de_fecha += 1;
  if (decision === "ERROR_AL_ENVIAR") ctx.counters.fallidos += 1;
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
      logger.info(
        `[RecordatoriosManoDeObra] Limpieza de logs viejos: ${borrados} archivos borrados (>${LOG_RETENTION_DAYS}d)`
      );
    }
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      logger.warn(
        "[RecordatoriosManoDeObra] Falló la limpieza de logs viejos",
        { message: error?.message }
      );
    }
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

function diasToArray(val: unknown): number[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter((n) => typeof n === "number");
  if (typeof val === "number") return [val];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed)
      ? parsed.filter((n: unknown) => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Envía por WhatsApp recordatorios de mano de obra a clientes
 * (solo WhatsApp, no crea notificaciones internas).
 *
 * El filtro de "cliente ya volvió a hacer el trabajo" se aplica en el
 * repositorio (NOT EXISTS en SQL), así el cron y la vista admin comparten
 * la misma fuente de verdad.
 */
export async function enviarRecordatoriosManoDeObraAClientes() {
  const today = dayjs().tz("America/Argentina/Buenos_Aires");
  const fechaHoy = today.format("YYYY-MM-DD");

  await limpiarLogsAntiguos();
  const ctx = await openRunLog(fechaHoy);
  let success = false;

  logger.info(
    "[RecordatoriosManoDeObra] ========== INICIO envío =========="
  );

  try {
    const repo = new PrismaRecordatorioManoDeObraRepository();
    const rows = await repo.findTrabajosConRecordatorio();

    for (const row of rows) {
      const dias = diasToArray(row.diasParaRecordatorio);
      const fechaSalidaStr = dayjs
        .utc(row.fechaSalidaReparacion)
        .format("YYYY-MM-DD");
      const fechaSalida = dayjs.tz(
        fechaSalidaStr,
        "America/Argentina/Buenos_Aires"
      );
      const diaMatch = dias.find(
        (dia) =>
          fechaSalida.add(dia, "day").format("YYYY-MM-DD") === fechaHoy
      );

      const info = {
        fullName: row.fullName,
        phone: row.phone,
        patent: row.patent,
        descripcion: row.descripcion,
        fechaSalida: fechaSalidaStr,
        diaRecordatorio: diaMatch ?? null,
      };

      if (diaMatch === undefined) {
        writeItem(
          ctx,
          info,
          "OMITIDO_FUERA_DE_FECHA",
          `días=[${dias.join(",")}] no matchean con hoy=${fechaHoy}`
        );
        continue;
      }

      const itemStart = Date.now();
      try {
        await sendWhatsAppMessage(row.phone, "recordatorio_reparacion", [
          row.fullName,
          row.descripcion,
          row.patent,
          new Date(row.fechaSalidaReparacion).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        ]);
        writeItem(
          ctx,
          info,
          "ENVIADO",
          `WhatsApp enviado (plantilla=recordatorio_reparacion)`,
          Date.now() - itemStart
        );
      } catch (error: any) {
        writeItem(
          ctx,
          info,
          "ERROR_AL_ENVIAR",
          `ERROR ${error?.name ?? "Unknown"}: ${error?.message ?? "sin mensaje"}`,
          Date.now() - itemStart
        );
        logger.error("[RecordatoriosManoDeObra] error al enviar WhatsApp", {
          phone: row.phone,
          descripcion: row.descripcion,
          message: error?.message,
        });
      }
    }

    success = true;
    logger.info(
      "[RecordatoriosManoDeObra] ========== FIN envío OK ==========",
      {
        ...ctx.counters,
        logFile: ctx.filePath,
      }
    );
  } catch (error: any) {
    logger.error(
      "[RecordatoriosManoDeObra] Error crítico durante la corrida",
      { message: error?.message, logFile: ctx.filePath }
    );
  } finally {
    await closeRunLog(ctx, success);
  }
}

export function initRecordatoriosManoDeObraAClientesCron() {
  cron.schedule(
    "0 10 * * *",
    () => {
      enviarRecordatoriosManoDeObraAClientes();
    },
    { scheduled: true, timezone: "America/Argentina/Buenos_Aires" }
  );

  logger.info(
    "[RecordatoriosManoDeObra] Cron iniciado (diario 10:00 America/Argentina/Buenos_Aires)"
  );
}
