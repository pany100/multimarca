import { getUsersToNotify } from "@/utils/notificationUtils";
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

async function enviarNotificacionesTurnos() {
  try {
    // Get current date in Argentina's timezone
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    console.log("Fecha en Argentina:", today.format("YYYY-MM-DD"));
    console.log(
      "Buscando turnos entre:",
      startOfDay.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      "y",
      endOfDay.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );

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
      console.log(`Turnos encontrados: ${turnosHoy.length}`);
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
      console.log("No hay turnos encontrados");
    }
  } catch (error) {
    console.error("Error al procesar notificaciones de turnos:", error);
  }
}

async function enviarRecordatoriosMantenimiento() {
  try {
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");
    console.log(`Buscando recordatorios para el día ${fechaHoy}`);
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
    console.error("Error al enviar recordatorios de mantenimiento:", error);
  }
}

async function enviarNotificacionesAgenda() {
  try {
    // Get current date in Argentina's timezone
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    console.log("Fecha en Argentina:", today.format("YYYY-MM-DD"));
    console.log(
      "Buscando eventos de agenda entre:",
      startOfDay.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      "y",
      endOfDay.toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      })
    );

    // Obtener eventos de agenda del día
    const eventosHoy = await prisma.recordatorioAgenda.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
        hecho: false,
      },
    });

    if (eventosHoy.length > 0) {
      console.log(`Eventos de agenda encontrados: ${eventosHoy.length}`);

      // Procesar cada evento individualmente
      for (const evento of eventosHoy) {
        // Si el evento no tiene usuario creador, lo saltamos
        if (!evento.userId) {
          console.log(
            `Evento "${evento.titulo}" no tiene usuario creador, saltando notificación`
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

        console.log(
          `Notificación enviada al usuario ${evento.userId} para el evento "${evento.titulo}"`
        );
      }
    } else {
      console.log("No hay eventos de agenda encontrados para hoy");
    }
  } catch (error) {
    console.error(
      "Error al procesar notificaciones de eventos de agenda:",
      error
    );
  }
}

async function procesarNotificacionesImportantes() {
  try {
    console.log(
      `[${new Date().toISOString()}] Iniciando cronjob de notificaciones importantes`
    );

    await Promise.all([
      enviarNotificacionesTurnos(),
      enviarRecordatoriosMantenimiento(),
      enviarNotificacionesAgenda(),
    ]);

    console.log(
      `[${new Date().toISOString()}] Finalizando cronjob de notificaciones importantes`
    );
  } catch (error) {
    console.error("Error al procesar notificaciones importantes:", error);
  }
}

export function initNotificacionesImportantesCron() {
  // Programar el cronjob para que se ejecute todos los días a las 7:00 AM
  cron.schedule("0 7 * * *", () => {
    console.log("Ejecutando cronjob de notificaciones importantes");
    procesarNotificacionesImportantes();
  });

  console.log("Cron job para notificaciones importantes iniciado");
}
