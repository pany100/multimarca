import { sendWhatsAppMessage } from "@/services/whatsappService";
import { getUsersToNotify } from "@/utils/notificationUtils";
import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const prisma = new PrismaClient();

async function enviarRecordatoriosTrabajos() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de recordatorios de trabajos`
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
        return Array.isArray(parsed) ? parsed.filter((n: unknown) => typeof n === "number") : [];
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
      // Enviar mensaje de WhatsApp de recordatorio
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
      const users = await getUsersToNotify();
      // Crear notificación interna para los recordatorios
      for (const user of users) {
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `Recordatorios de mano de obra`,
            texto: `El cliente ${trabajo.fullName} tiene un recordatorio de mano de obra para hoy: ${trabajo.descripcion} para el auto ${trabajo.patent}`,
            leida: false,
            tipo: TipoNotificacionInterna.RECORDATORIOS_MANO_DE_OBRA,
            userId: user.id,
          },
        });
      }
    }

    console.log(
      `[${new Date().toISOString()}] Finalizando cronjob de recordatorios de trabajos`
    );
  } catch (error) {
    console.error("Error al enviar recordatorios de trabajos:", error);
  }
}

export function initRecordatoriosTrabajosCron() {
  // Programar el cronjob para que se ejecute todos los días a las 9:00 AM
  cron.schedule("0 10 * * *", () => {
    console.log("Ejecutando cronjob de recordatorios de trabajos");
    enviarRecordatoriosTrabajos();
  });

  console.log("Cron job para recordatorios de trabajos iniciado");
}
