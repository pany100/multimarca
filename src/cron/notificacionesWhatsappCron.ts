import { sendWhatsAppMessage } from "@/services/whatsappService";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

async function enviarNotificacionesWhatsApp() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de notificaciones WhatsApp`
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener notificaciones para hoy
    const notificaciones = await prisma.notificacionWhatsapp.findMany({
      where: {
        date: {
          gte: hoy,
          lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
        },
        processed: false,
      },
    });
    console.log(notificaciones);

    // Obtener clientes no silenciados
    const clientesNoSilenciados = await prisma.cliente.findMany({
      where: {
        can_receive_notifications: true,
      },
    });

    for (const notificacion of notificaciones) {
      for (const cliente of clientesNoSilenciados) {
        // Aquí iría la lógica para enviar el mensaje de WhatsApp
        await sendWhatsAppMessage("1156007307", notificacion.whatsappKey);
        console.log(
          `Notificación enviada a ${cliente.fullName}: ${notificacion.description}`
        );
        break;
      }

      // Marcar la notificación como procesada
      await prisma.notificacionWhatsapp.update({
        where: { id: notificacion.id },
        data: { processed: true },
      });
    }

    console.log(
      `[${new Date().toISOString()}] Finalizando cronjob de notificaciones WhatsApp`
    );
  } catch (error) {
    console.error("Error al procesar notificaciones:", error);
  }
}

// Programar el cronjob para que se ejecute todos los días a las 9:00 AM
cron.schedule("0 9 * * *", () => {
  console.log("Ejecutando cronjob de notificaciones WhatsApp");
  enviarNotificacionesWhatsApp();
});

export default enviarNotificacionesWhatsApp;
