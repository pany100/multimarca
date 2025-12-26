import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { EstadoArchivo, PrismaClient } from "@prisma/client";
import cron from "node-cron";
import logger from "../lib/logger.js";

const prisma = new PrismaClient();
const fileStorage = new S3FileStorageAdapter();
const isDev = process.env.NODE_ENV !== "production";

/**
 * Elimina archivos huérfanos (sin relaciones) del S3 y de la base de datos
 */
async function limpiarArchivosHuerfanos() {
  try {
    logger.info("[S3FileSync] Iniciando búsqueda de archivos huérfanos");

    const archivosHuerfanos = await prisma.customFile.findMany({
      where: {
        ordenReparacionId: null,
        reciboORepId: null,
        reparacionDeTerceroId: null,
      },
    });

    logger.info(
      `[S3FileSync] Archivos huérfanos encontrados: ${archivosHuerfanos.length}`
    );

    for (const archivo of archivosHuerfanos) {
      try {
        // Verificar que el archivo no esté siendo usado por otro registro válido
        const pathToCheck = archivo.finalPath || archivo.tempPath;
        let accion = "";

        if (pathToCheck) {
          const archivoValido = await prisma.customFile.findFirst({
            where: {
              id: { not: archivo.id },
              OR: [{ finalPath: pathToCheck }, { tempPath: pathToCheck }],
              AND: {
                OR: [
                  { ordenReparacionId: { not: null } },
                  { reciboORepId: { not: null } },
                  { reparacionDeTerceroId: { not: null } },
                ],
              },
            },
          });

          if (archivoValido) {
            accion = `compartido con archivo ID ${archivoValido.id}, solo eliminado de BD`;
          } else {
            if (!isDev) {
              await fileStorage.removeFile(pathToCheck);
              accion = "eliminado de S3 y BD";
            } else {
              accion = "eliminado de S3 y BD (SIMULADO - modo dev)";
            }
          }
        } else {
          accion = "sin path, solo eliminado de BD";
        }

        if (!isDev) {
          await prisma.customFile.delete({
            where: { id: archivo.id },
          });
        }

        const entidadId =
          archivo.ordenReparacionId ||
          archivo.reciboORepId ||
          archivo.reparacionDeTerceroId ||
          "sin entidad";
        const entidadTipo = archivo.ordenReparacionId
          ? "OrdenReparacion"
          : archivo.reciboORepId
          ? "ReciboORep"
          : archivo.reparacionDeTerceroId
          ? "ReparacionTercero"
          : "ninguna";
        logger.info(
          `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: huérfano) → ${accion}`
        );
      } catch (error) {
        const entidadId =
          archivo.ordenReparacionId ||
          archivo.reciboORepId ||
          archivo.reparacionDeTerceroId ||
          "sin entidad";
        const entidadTipo = archivo.ordenReparacionId
          ? "OrdenReparacion"
          : archivo.reciboORepId
          ? "ReciboORep"
          : archivo.reparacionDeTerceroId
          ? "ReparacionTercero"
          : "ninguna";
        logger.error(
          `[S3FileSync] Archivo ID ${
            archivo.id
          } (${entidadTipo} ${entidadId}, estado: huérfano) → ERROR: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }
  } catch (error) {
    logger.error(
      `[S3FileSync] Error general al limpiar archivos huérfanos: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Procesa archivos con estado Error, intentando subirlos nuevamente
 */
async function procesarArchivosConError() {
  try {
    logger.info(
      "[S3FileSync] Iniciando procesamiento de archivos con estado Error"
    );

    const archivosConError = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Error,
      },
    });

    logger.info(
      `[S3FileSync] Archivos con estado Error encontrados: ${archivosConError.length}`
    );

    for (const archivo of archivosConError) {
      const entidadId =
        archivo.ordenReparacionId ||
        archivo.reciboORepId ||
        archivo.reparacionDeTerceroId ||
        "sin entidad";
      const entidadTipo = archivo.ordenReparacionId
        ? "OrdenReparacion"
        : archivo.reciboORepId
        ? "ReciboORep"
        : archivo.reparacionDeTerceroId
        ? "ReparacionTercero"
        : "ninguna";

      try {
        if (!archivo.tempPath) {
          logger.warn(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Error) → sin tempPath, omitido`
          );
          continue;
        }

        if (archivo.finalPath) {
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });
          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Error) → ya tiene finalPath, actualizado a Listo`
          );
          continue;
        }

        const folder = archivo.ordenReparacionId ? "scanner" : "recibos";

        if (!isDev) {
          const finalPath = await fileStorage.moveTempTo(
            archivo.tempPath,
            folder
          );

          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              finalPath,
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });

          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Error) → movido de temp a ${folder}, actualizado a Listo`
          );
        } else {
          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Error) → movido de temp a ${folder}, actualizado a Listo (SIMULADO - modo dev)`
          );
        }
      } catch (error) {
        logger.error(
          `[S3FileSync] Archivo ID ${
            archivo.id
          } (${entidadTipo} ${entidadId}, estado: Error) → ERROR: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }
  } catch (error) {
    logger.error(
      `[S3FileSync] Error general al procesar archivos con estado Error: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Procesa archivos con estado Pending
 */
async function procesarArchivosPending() {
  try {
    logger.info(
      "[S3FileSync] Iniciando procesamiento de archivos con estado Pending"
    );

    const archivosPending = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Pendiente,
      },
    });

    logger.info(
      `[S3FileSync] Archivos con estado Pending encontrados: ${archivosPending.length}`
    );

    for (const archivo of archivosPending) {
      const entidadId =
        archivo.ordenReparacionId ||
        archivo.reciboORepId ||
        archivo.reparacionDeTerceroId ||
        "sin entidad";
      const entidadTipo = archivo.ordenReparacionId
        ? "OrdenReparacion"
        : archivo.reciboORepId
        ? "ReciboORep"
        : archivo.reparacionDeTerceroId
        ? "ReparacionTercero"
        : "ninguna";

      try {
        if (!archivo.tempPath) {
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Error,
              promotedAt: new Date(),
            },
          });
          logger.warn(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Pending) → sin tempPath, marcado como Error`
          );
          continue;
        }

        if (archivo.finalPath) {
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });
          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Pending) → ya tiene finalPath, actualizado a Listo`
          );
          continue;
        }

        const folder = archivo.ordenReparacionId ? "scanner" : "recibos";

        if (!isDev) {
          const finalPath = await fileStorage.moveTempTo(
            archivo.tempPath,
            folder
          );

          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              finalPath,
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });

          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Pending) → movido de temp a ${folder}, actualizado a Listo`
          );
        } else {
          logger.info(
            `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Pending) → movido de temp a ${folder}, actualizado a Listo (SIMULADO - modo dev)`
          );
        }
      } catch (error) {
        logger.error(
          `[S3FileSync] Archivo ID ${
            archivo.id
          } (${entidadTipo} ${entidadId}, estado: Pending) → ERROR: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }
  } catch (error) {
    logger.error(
      `[S3FileSync] Error general al procesar archivos Pending: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Elimina archivos marcados como borrados
 */
async function eliminarArchivosBorrados() {
  try {
    logger.info(
      "[S3FileSync] Iniciando eliminación de archivos marcados como Borrado"
    );

    const archivosBorrados = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Borrado,
      },
    });

    logger.info(
      `[S3FileSync] Archivos marcados como Borrado encontrados: ${archivosBorrados.length}`
    );

    for (const archivo of archivosBorrados) {
      const entidadId =
        archivo.ordenReparacionId ||
        archivo.reciboORepId ||
        archivo.reparacionDeTerceroId ||
        "sin entidad";
      const entidadTipo = archivo.ordenReparacionId
        ? "OrdenReparacion"
        : archivo.reciboORepId
        ? "ReciboORep"
        : archivo.reparacionDeTerceroId
        ? "ReparacionTercero"
        : "ninguna";

      try {
        let accion = "";
        if (archivo.finalPath) {
          if (!isDev) {
            await fileStorage.removeFile(archivo.finalPath);
            accion = "eliminado de S3 y BD";
          } else {
            accion = "eliminado de S3 y BD (SIMULADO - modo dev)";
          }
        } else {
          accion = "sin finalPath, solo eliminado de BD";
        }

        if (!isDev) {
          await prisma.customFile.delete({
            where: { id: archivo.id },
          });
        }

        logger.info(
          `[S3FileSync] Archivo ID ${archivo.id} (${entidadTipo} ${entidadId}, estado: Borrado) → ${accion}`
        );
      } catch (error) {
        logger.error(
          `[S3FileSync] Archivo ID ${
            archivo.id
          } (${entidadTipo} ${entidadId}, estado: Borrado) → ERROR: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }
  } catch (error) {
    logger.error(
      `[S3FileSync] Error general al eliminar archivos Borrado: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Ejecuta todas las tareas de sincronización de archivos
 */
async function sincronizarArchivos() {
  logger.info(
    "[S3FileSync] ========== INICIANDO SINCRONIZACIÓN DE ARCHIVOS S3 =========="
  );

  try {
    // 1. Limpiar archivos huérfanos
    await limpiarArchivosHuerfanos();

    // 2. Procesar archivos con error
    await procesarArchivosConError();

    // 3. Eliminar archivos borrados
    await eliminarArchivosBorrados();

    // 4. Procesar archivos pendientes
    await procesarArchivosPending();

    logger.info(
      "[S3FileSync] ========== SINCRONIZACIÓN DE ARCHIVOS S3 COMPLETADA =========="
    );
  } catch (error) {
    logger.error(
      `[S3FileSync] Error crítico durante la sincronización: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

/**
 * Inicializa el cron job para sincronización de archivos S3
 */
export function initS3FileSyncCron() {
  // Ejecutar cada día a las 3:00 AM (cuando hay menos carga en el sistema)
  cron.schedule("0 3 * * *", sincronizarArchivos, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires",
  });

  logger.info(
    "[S3FileSync] Cron job para sincronización de archivos S3 iniciado - Ejecuta diariamente a las 3:00 AM"
  );
}

// Ejecutar inmediatamente al iniciar la aplicación (opcional)
// sincronizarArchivos();
