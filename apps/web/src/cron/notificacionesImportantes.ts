import { getUsersToNotify } from "@/utils/notificationUtils";
import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";
import logger from "../lib/logger.js";

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const prisma = new PrismaClient();

async function enviarNotificacionesTurnos() {
  try {
    // Get current date in Argentina's timezone
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    logger.info("[NotificacionesImportantes] Buscando turnos del día", {
      fecha: today.format("YYYY-MM-DD"),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });

    // Obtener turnos del día
    const turnosHoy = await prisma.turno.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (turnosHoy.length > 0) {
      logger.info(
        `[NotificacionesImportantes] Turnos encontrados: ${turnosHoy.length}`
      );
      // Crear notificación interna para los turnos del día
      const users = await getUsersToNotify();
      for (const user of users) {
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `Turnos del día`,
            texto: `Hay ${
              turnosHoy.length
            } turno(s) programado(s) para hoy:\n${turnosHoy
              .map(
                (turno) =>
                  `- ${turno.hora} - ${turno.auto.owner.fullName} (${turno.auto.patent})`
              )
              .join("\n")}`,
            leida: false,
            tipo: TipoNotificacionInterna.TURNOS_DEL_DIA,
            userId: user.id,
          },
        });
      }
    } else {
      logger.info("[NotificacionesImportantes] No hay turnos para hoy");
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al procesar notificaciones de turnos",
      { error }
    );
  }
}

async function enviarRecordatoriosMantenimiento() {
  try {
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");
    logger.info(
      "[NotificacionesImportantes] Buscando recordatorios de mantenimiento",
      { fecha: fechaHoy }
    );
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
      JOIN
        ManoDeObra mo ON tr.descripcion = mo.name
      WHERE 
        orep.estado = 'Terminado'
      AND 
        c.can_receive_notifications = true
      AND 
        mo.id IN (106, 108, 110, 289, 1, 2, 304, 153, 320, 9, 156, 4, 154, 7, 8, 155, 157, 10, 11)
      AND 
        tr.diasParaRecordatorio IS NOT NULL
      AND 
        DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) = ${fechaHoy}
    `;

    if (trabajosParaRecordar.length > 0) {
      const users = await getUsersToNotify();
      // Crear notificación interna para los recordatorios
      for (const user of users) {
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `Recordatorios de mantenimiento`,
            texto: `Hay ${
              trabajosParaRecordar.length
            } recordatorio(s) de mantenimiento para hoy:\n${trabajosParaRecordar
              .map(
                (trabajo) =>
                  `- ${trabajo.fullName} (${trabajo.patent}) - ${trabajo.descripcion}`
              )
              .join("\n")}`,
            leida: false,
            tipo: TipoNotificacionInterna.RECORDATORIOS_MANO_DE_OBRA,
            userId: user.id,
          },
        });
      }
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al enviar recordatorios de mantenimiento",
      { error }
    );
  }
}

async function enviarNotificacionesAgenda() {
  try {
    // Get current date in Argentina's timezone
    // TESTING: Simulating tomorrow's date
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const year = today.year();
    const month = today.month() + 1; // dayjs months are 0-indexed
    const day = today.date();

    logger.info("[NotificacionesImportantes] Buscando eventos de agenda", {
      fecha: today.format("YYYY-MM-DD"),
      year,
      month,
      day,
    });

    // Usar el repositorio para obtener eventos del día (incluyendo recurrentes)
    const { PrismaAgendaRepository } = await import(
      "@/core/infrastructure/database/repositories/prisma-agenda.repository"
    );
    const agendaRepo = new PrismaAgendaRepository();
    const eventosHoy = await agendaRepo.listByDay({
      year,
      month,
      day,
      onlyPending: true,
    });

    logger.info(
      `[NotificacionesImportantes] Eventos de agenda encontrados: ${eventosHoy.length}`
    );

    if (eventosHoy.length > 0) {
      // Procesar cada evento individualmente
      for (const evento of eventosHoy) {
        // Si el evento no tiene usuario creador, lo saltamos
        if (!evento.userId) {
          logger.warn(
            "[NotificacionesImportantes] Evento sin usuario creador",
            {
              eventoId: evento.id,
              titulo: evento.titulo,
            }
          );
          continue;
        }

        // Enviar notificación solo al creador del evento
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `Evento de agenda para hoy`,
            texto: `Tienes un evento programado para hoy:\n- ${dayjs(
              evento.fecha
            ).format("HH:mm")} - ${evento.titulo}${
              evento.descripcion ? `: ${evento.descripcion}` : ""
            }`,
            leida: false,
            tipo: TipoNotificacionInterna.EVENTO_AGENDA,
            userId: evento.userId,
          },
        });

        logger.info(
          "[NotificacionesImportantes] Notificación de evento enviada",
          {
            userId: evento.userId,
            eventoId: evento.id,
            titulo: evento.titulo,
          }
        );
      }
    } else {
      logger.info(
        "[NotificacionesImportantes] No hay eventos de agenda para hoy"
      );
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al procesar notificaciones de eventos de agenda",
      { error }
    );
  }
}

async function procesarNotificacionesImportantes() {
  try {
    logger.info(
      "[NotificacionesImportantes] ========== INICIANDO CRONJOB =========="
    );

    await Promise.all([
      enviarNotificacionesTurnos(),
      enviarRecordatoriosMantenimiento(),
      enviarNotificacionesAgenda(),
    ]);

    logger.info(
      "[NotificacionesImportantes] ========== CRONJOB COMPLETADO =========="
    );
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error crítico al procesar notificaciones",
      { error }
    );
  }
}

export function initNotificacionesImportantesCron() {
  // Programar el cronjob para que se ejecute a las 7am todos los días
  cron.schedule("0 7 * * *", () => {
    logger.info(
      "[NotificacionesImportantes] Ejecutando cronjob de notificaciones importantes"
    );
    procesarNotificacionesImportantes();
  });

  logger.info(
    "[NotificacionesImportantes] Cron job para notificaciones importantes iniciado - Ejecuta diariamente a las 7:00 AM"
  );
}
