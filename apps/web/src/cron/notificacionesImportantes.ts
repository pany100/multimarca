import { NotificationService } from "@/core/application/services/notification.service";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import logger from "@/lib/logger";
import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import cron from "node-cron";

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const prisma = new PrismaClient();
const notificationService = new NotificationService(
  new PrismaNotificationRepository(),
);

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
        `[NotificacionesImportantes] Turnos encontrados: ${turnosHoy.length}`,
      );
      // Crear notificación interna para los turnos del día (una por usuario que puede recibir notificaciones)
      await notificationService.create({
        fecha: new Date(),
        titulo: `Turnos del día`,
        texto: `Hay ${
          turnosHoy.length
        } turno(s) programado(s) para hoy:\n${turnosHoy
          .map((turno) =>
            turno.auto
              ? `- ${turno.hora} - ${turno.auto.owner.fullName} (${turno.auto.patent})`
              : `- ${turno.hora} - ${turno.informacionCliente || "Sin información"}${turno.informacionAuto ? ` (${turno.informacionAuto})` : ""}`,
          )
          .join("\n")}`,
        leida: false,
        tipo: TipoNotificacionInterna.TURNOS_DEL_DIA,
      });
    } else {
      logger.info("[NotificacionesImportantes] No hay turnos para hoy");
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al procesar notificaciones de turnos",
      { error },
    );
  }
}

async function enviarRecordatoriosMantenimiento() {
  try {
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");
    logger.info(
      "[NotificacionesImportantes] Buscando recordatorios de mantenimiento",
      { fecha: fechaHoy },
    );
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
      const fechaSalida = dayjs(row.fechaSalidaReparacion)
        .tz("America/Argentina/Buenos_Aires")
        .startOf("day");
      return dias.some(
        (dia) => fechaSalida.add(dia, "day").format("YYYY-MM-DD") === fechaHoy,
      );
    });

    logger.info(
      "[NotificacionesImportantes] Recordatorios mantenimiento",
      {
        fechaHoy,
        totalFilasQuery: rows.length,
        totalParaRecordarHoy: trabajosParaRecordar.length,
      },
    );

    if (trabajosParaRecordar.length > 0) {
      await notificationService.create({
        fecha: new Date(),
        titulo: `Recordatorios de mantenimiento`,
        texto: `Hay ${
          trabajosParaRecordar.length
        } recordatorio(s) de mantenimiento para hoy:\n${trabajosParaRecordar
          .map(
            (trabajo) =>
              `- ${trabajo.fullName} (${trabajo.patent}) - ${trabajo.descripcion}`,
          )
          .join("\n")}`,
        leida: false,
        tipo: TipoNotificacionInterna.RECORDATORIOS_MANO_DE_OBRA,
      });
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al enviar recordatorios de mantenimiento",
      { error, stack: error instanceof Error ? error.stack : undefined },
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
    const { PrismaAgendaRepository } =
      await import("@/core/infrastructure/database/repositories/prisma-agenda.repository");
    const agendaRepo = new PrismaAgendaRepository();
    const eventosHoy = await agendaRepo.listByDay({
      year,
      month,
      day,
      onlyPending: true,
    });

    logger.info(
      `[NotificacionesImportantes] Eventos de agenda encontrados: ${eventosHoy.length}`,
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
            },
          );
          continue;
        }

        // Enviar notificación solo al creador del evento
        await notificationService.create({
          fecha: new Date(),
          titulo: `Evento de agenda para hoy`,
          texto: `Tienes un evento programado para hoy:\n- ${dayjs(
            evento.fecha,
          ).format("HH:mm")} - ${evento.titulo}${
            evento.descripcion ? `: ${evento.descripcion}` : ""
          }`,
          leida: false,
          tipo: TipoNotificacionInterna.EVENTO_AGENDA,
          userId: evento.userId,
        });

        logger.info(
          "[NotificacionesImportantes] Notificación de evento enviada",
          {
            userId: evento.userId,
            eventoId: evento.id,
            titulo: evento.titulo,
          },
        );
      }
    } else {
      logger.info(
        "[NotificacionesImportantes] No hay eventos de agenda para hoy",
      );
    }
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error al procesar notificaciones de eventos de agenda",
      { error },
    );
  }
}

export async function procesarNotificacionesImportantes() {
  try {
    logger.info(
      "[NotificacionesImportantes] ========== INICIANDO CRONJOB ==========",
    );

    await Promise.all([
      enviarNotificacionesTurnos(),
      enviarRecordatoriosMantenimiento(),
      enviarNotificacionesAgenda(),
    ]);

    logger.info(
      "[NotificacionesImportantes] ========== CRONJOB COMPLETADO ==========",
    );
  } catch (error) {
    logger.error(
      "[NotificacionesImportantes] Error crítico al procesar notificaciones",
      { error },
    );
  }
}

export function initNotificacionesImportantesCron() {
  // Programar el cronjob para que se ejecute a las 7am todos los días
  cron.schedule("0 7 * * *", () => {
    logger.info(
      "[NotificacionesImportantes] Ejecutando cronjob de notificaciones importantes",
    );
    procesarNotificacionesImportantes();
  });

  logger.info(
    "[NotificacionesImportantes] Cron job para notificaciones importantes iniciado - Ejecuta diariamente a las 7:00 AM",
  );
}
