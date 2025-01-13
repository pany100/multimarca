import { sendWhatsAppMessage } from "@/services/whatsappService";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

async function enviarRecordatoriosTrabajos() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de recordatorios de trabajos`
    );

    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    const trabajosParaRecordar: {
      fullName: string;
      phone: string;
      fechaSalidaReparacion: string;
      patent: string;
      descripcion: string;
    }[] = await prisma.$queryRaw`
      SELECT 
        c.fullName, 
        c.phone,
        a.patent,
        orep.fechaSalidaReparacion, 
        tr.descripcion
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
        DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) = ${fechaHoy}
    `;

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
