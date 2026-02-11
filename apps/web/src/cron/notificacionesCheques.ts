import { NotificationService } from "@/core/application/services/notification.service";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
const notificationService = new NotificationService(
  new PrismaNotificationRepository(),
);

export async function enviarNotificacionesCheques() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de notificaciones de cheques`,
    );

    const hoy = new Date();
    const tresDiasDespues = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Obtener cheques que vencen en menos de 3 días
    const cheques = await prisma.cheque.findMany({
      where: {
        fechaCobro: {
          gte: hoy,
          lt: tresDiasDespues,
        },
      },
    });

    for (const cheque of cheques) {
      await notificationService.create({
        fecha: new Date(),
        titulo: `Cheque próximo a vencer`,
        texto: `El cheque N° ${cheque.numero} por $${
          cheque.importe
        } vence el ${new Date(cheque.fechaCobro).toLocaleDateString("es-AR")}`,
        leida: false,
        tipo: TipoNotificacionInterna.CHEQUE_POR_VENCER,
      });
    }

    console.log(
      `[${new Date().toISOString()}] Finalizando cronjob de notificaciones de cheques`,
    );
  } catch (error) {
    console.error("Error al procesar notificaciones de cheques:", error);
  }
}

export function initNotificacionesChequesCron() {
  // Programar el cronjob para que se ejecute todos los días a las 8:00 AM
  cron.schedule("0 7 * * *", () => {
    console.log("Ejecutando cronjob de notificaciones de cheques");
    enviarNotificacionesCheques();
  });

  console.log("Cron job para notificaciones de cheques iniciado");
}
