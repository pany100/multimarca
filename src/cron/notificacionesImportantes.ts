import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();

async function enviarNotificacionesTurnos() {
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Obtener turnos del día
    const turnosHoy = await prisma.turno.findMany({
      where: {
        fecha: {
          gte: new Date(fechaHoy),
          lt: new Date(new Date(fechaHoy).getTime() + 24 * 60 * 60 * 1000),
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
      // Crear notificación interna para los turnos del día
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
        },
      });
    }
  } catch (error) {
    console.error("Error al procesar notificaciones de turnos:", error);
  }
}

async function enviarRecordatoriosMantenimiento() {
  try {
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

    if (trabajosParaRecordar.length > 0) {
      // Crear notificación interna para los recordatorios
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
        },
      });
    }
  } catch (error) {
    console.error("Error al enviar recordatorios de mantenimiento:", error);
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
