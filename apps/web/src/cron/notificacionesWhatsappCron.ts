import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import logger from "../lib/logger.js";

const prisma = new PrismaClient();

async function enviarNotificacionesWhatsApp() {
  try {
    logger.info(
      "[NotificacionesWhatsApp] Iniciando cronjob de notificaciones WhatsApp"
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
    logger.info("[NotificacionesWhatsApp] Notificaciones encontradas", {
      cantidad: notificaciones.length,
    });

    // Obtener clientes no silenciados
    const clientesNoSilenciados = await prisma.cliente.findMany({
      where: {
        can_receive_notifications: true,
      },
    });

    for (const notificacion of notificaciones) {
      for (const cliente of clientesNoSilenciados) {
        // Aquí iría la lógica para enviar el mensaje de WhatsApp
        if (cliente.phone) {
          // await sendWhatsAppMessage(cliente.phone, notificacion.whatsappKey);
          logger.info("[NotificacionesWhatsApp] Notificación enviada", {
            cliente: cliente.fullName,
            descripcion: notificacion.description,
          });
        }
      }

      // Marcar la notificación como procesada
      await prisma.notificacionWhatsapp.update({
        where: { id: notificacion.id },
        data: { processed: true },
      });
    }

    logger.info(
      "[NotificacionesWhatsApp] Finalizando cronjob de notificaciones WhatsApp"
    );
  } catch (error) {
    logger.error("[NotificacionesWhatsApp] Error al procesar notificaciones", {
      error,
    });
  }
}

export function initNotificacionesWhatsappCron() {
  // Programar el cronjob para que se ejecute todos los días a las 9:00 AM
  cron.schedule("0 9 * * *", () => {
    logger.info(
      "[NotificacionesWhatsApp] Ejecutando cronjob de notificaciones WhatsApp"
    );
    enviarNotificacionesWhatsApp();
  });

  logger.info(
    "[NotificacionesWhatsApp] Cron job para notificaciones de WhatsApp iniciado - Ejecuta diariamente a las 9:00 AM"
  );
}
