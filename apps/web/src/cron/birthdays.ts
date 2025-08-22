import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

async function enviarFelicitacionesCumpleaños() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de felicitaciones de cumpleaños`
    );

    const hoy = new Date();
    const diaHoy = hoy.getDate();
    const mesHoy = hoy.getMonth() + 1; // Los meses en JavaScript son 0-11, así que sumamos 1

    const clientesCumpleañeros: { fullName: string; phone: string }[] =
      await prisma.$queryRaw`
      SELECT * FROM Cliente
      WHERE can_receive_notifications = true
      AND EXTRACT(DAY FROM birthday) = ${diaHoy}
      AND EXTRACT(MONTH FROM birthday) = ${mesHoy}
    `;

    for (const cliente of clientesCumpleañeros) {
      // await sendWhatsAppMessage(cliente.phone, "feliz_cumple");
      console.log(`Felicitación de cumpleaños enviada a ${cliente.fullName}`);
    }

    console.log(
      `[${new Date().toISOString()}] Finalizando cronjob de felicitaciones de cumpleaños`
    );
  } catch (error) {
    console.error("Error al enviar felicitaciones de cumpleaños:", error);
  }
}

export function initCumpleañosCron() {
  // Programar el cronjob para que se ejecute todos los días a las 9:00 AM
  cron.schedule("0 10 * * *", () => {
    console.log("Ejecutando cronjob de felicitaciones de cumpleaños");
    enviarFelicitacionesCumpleaños();
  });

  console.log("Cron job para felicitaciones de cumpleaños iniciado");
}
