import { sendWhatsAppMessage } from "@/services/whatsappService";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const prisma = new PrismaClient();

/**
 * Envía por WhatsApp recordatorios de mano de obra a clientes
 * (solo WhatsApp, no crea notificaciones internas).
 */
export async function enviarRecordatoriosManoDeObraAClientes() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando envío de recordatorios de mano de obra a clientes`
    );

    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");
    console.log(`Buscando recordatorios para el día ${fechaHoy}`);

    type Row = {
      fullName: string;
      phone: string;
      fechaSalidaReparacion: Date;
      patent: string;
      descripcion: string;
      diasParaRecordatorio: unknown;
    };
    const rows: Row[] = await prisma.$queryRaw`
      SELECT 
        c.fullName, 
        c.phone,
        a.patent,
        orep.fechaSalidaReparacion, 
        tr.descripcion,
        tr.diasParaRecordatorio
      FROM
        OrdenReparacion orep
      JOIN
      	Auto a on a.id = orep.autoId
      JOIN 
        Cliente c ON a.ownerId = c.id
      JOIN 
        TrabajoRealizado tr ON orep.id = tr.ordenReparacionId
      WHERE 
        orep.estado = 'Terminado'
      AND 
        c.can_receive_notifications = true
      AND 
        tr.diasParaRecordatorio IS NOT NULL
      AND 
        JSON_LENGTH(tr.diasParaRecordatorio) > 0
    `;

    const diasToArray = (val: unknown): number[] => {
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
    };

    const trabajosParaRecordar = rows.filter((row) => {
      const dias = diasToArray(row.diasParaRecordatorio);
      const fechaSalida = dayjs(row.fechaSalidaReparacion).tz(
        "America/Argentina/Buenos_Aires"
      );
      return dias.some(
        (dia) => fechaSalida.add(dia, "day").format("YYYY-MM-DD") === fechaHoy
      );
    });

    for (const trabajo of trabajosParaRecordar) {
      await sendWhatsAppMessage(trabajo.phone, "recordatorio_reparacion", [
        trabajo.fullName,
        trabajo.descripcion,
        trabajo.patent,
        new Date(trabajo.fechaSalidaReparacion).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      ]);
    }

    console.log(
      `[${new Date().toISOString()}] Finalizando envío de recordatorios de mano de obra a clientes`
    );
  } catch (error) {
    console.error(
      "Error al enviar recordatorios de mano de obra a clientes:",
      error
    );
  }
}

export function initRecordatoriosManoDeObraAClientesCron() {
  cron.schedule("0 10 * * *", () => {
    console.log("Ejecutando cron: recordatorios de mano de obra a clientes");
    enviarRecordatoriosManoDeObraAClientes();
  });

  console.log(
    "Cron recordatorios de mano de obra a clientes iniciado (diario 10:00)"
  );
}
