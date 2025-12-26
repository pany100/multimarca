import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { EstadoArchivo, PrismaClient } from "@prisma/client";
import cron from "node-cron";
import logger from "../lib/logger.js";

const prisma = new PrismaClient();
const fileStorage = new S3FileStorageAdapter();

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
        logger.info("[S3FileSync] Procesando archivo huérfano", {
          archivoId: archivo.id,
          tempPath: archivo.tempPath,
          finalPath: archivo.finalPath,
          status: archivo.status,
        });

        // Verificar que el archivo no esté siendo usado por otro registro válido
        // Buscar tanto en finalPath como en tempPath
        const pathToCheck = archivo.finalPath || archivo.tempPath;

        if (pathToCheck) {
          // Buscar si existe otro CustomFile con el mismo path que SÍ tenga referencias
          const archivoValido = await prisma.customFile.findFirst({
            where: {
              id: { not: archivo.id }, // Excluir el archivo actual
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
            logger.info(
              "[S3FileSync] Archivo compartido detectado - NO se eliminará de S3",
              {
                archivoHuerfanoId: archivo.id,
                archivoValidoId: archivoValido.id,
                path: pathToCheck,
                entidadValida: {
                  ordenReparacionId: archivoValido.ordenReparacionId,
                  reciboORepId: archivoValido.reciboORepId,
                  reparacionDeTerceroId: archivoValido.reparacionDeTerceroId,
                },
              }
            );
          } else {
            // Solo eliminar de S3 si no hay otro registro válido usando este archivo
            await fileStorage.removeFile(pathToCheck);
            logger.info("[S3FileSync] Archivo eliminado de S3", {
              archivoId: archivo.id,
              path: pathToCheck,
              accion: "DELETE_FROM_S3",
            });
          }
        }

        // Eliminar el registro de la base de datos (siempre, ya que es huérfano)
        await prisma.customFile.delete({
          where: { id: archivo.id },
        });

        logger.info(
          "[S3FileSync] Registro de archivo huérfano eliminado de BD",
          {
            archivoId: archivo.id,
            accion: "DELETE_FROM_DB",
          }
        );
      } catch (error) {
        logger.error("[S3FileSync] Error al eliminar archivo huérfano", {
          archivoId: archivo.id,
          tempPath: archivo.tempPath,
          finalPath: archivo.finalPath,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("[S3FileSync] Error general al limpiar archivos huérfanos", {
      error,
    });
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
      try {
        if (!archivo.tempPath) {
          logger.warn("[S3FileSync] Archivo sin tempPath - omitiendo", {
            archivoId: archivo.id,
            status: archivo.status,
            ordenReparacionId: archivo.ordenReparacionId,
            reciboORepId: archivo.reciboORepId,
            reparacionDeTerceroId: archivo.reparacionDeTerceroId,
          });
          continue;
        }

        if (archivo.finalPath) {
          logger.info(
            "[S3FileSync] Archivo Error con finalPath - actualizando a Listo",
            {
              archivoId: archivo.id,
              finalPath: archivo.finalPath,
              ordenReparacionId: archivo.ordenReparacionId,
              reciboORepId: archivo.reciboORepId,
              reparacionDeTerceroId: archivo.reparacionDeTerceroId,
              accion: "UPDATE_STATUS_TO_LISTO",
            }
          );
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });
          continue;
        }

        // Determinar la carpeta de destino basada en las relaciones
        let folder = "archivos";
        let entidad = "ninguna";
        if (archivo.ordenReparacionId) {
          folder = "scanner";
          entidad = "ordenReparacion";
        } else if (archivo.reciboORepId) {
          folder = "recibos";
          entidad = "reciboORep";
        } else if (archivo.reparacionDeTerceroId) {
          folder = "recibos";
          entidad = "reparacionDeTercero";
        }

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

        logger.info("[S3FileSync] Archivo Error movido exitosamente", {
          archivoId: archivo.id,
          tempPath: archivo.tempPath,
          finalPath,
          folder,
          entidad,
          ordenReparacionId: archivo.ordenReparacionId,
          reciboORepId: archivo.reciboORepId,
          reparacionDeTerceroId: archivo.reparacionDeTerceroId,
          accion: "MOVE_TEMP_TO_FINAL",
        });
      } catch (error) {
        logger.error(
          "[S3FileSync] Error al procesar archivo con estado Error",
          {
            archivoId: archivo.id,
            tempPath: archivo.tempPath,
            finalPath: archivo.finalPath,
            ordenReparacionId: archivo.ordenReparacionId,
            reciboORepId: archivo.reciboORepId,
            reparacionDeTerceroId: archivo.reparacionDeTerceroId,
            error,
          }
        );
      }
    }
  } catch (error) {
    logger.error(
      "[S3FileSync] Error general al procesar archivos con estado Error",
      { error }
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
      try {
        if (!archivo.tempPath) {
          logger.warn(
            "[S3FileSync] Archivo sin tempPath - marcando como Error",
            {
              archivoId: archivo.id,
              status: archivo.status,
              ordenReparacionId: archivo.ordenReparacionId,
              reciboORepId: archivo.reciboORepId,
              reparacionDeTerceroId: archivo.reparacionDeTerceroId,
              accion: "MARK_AS_ERROR",
            }
          );
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Error,
              promotedAt: new Date(),
            },
          });
          continue;
        }

        if (archivo.finalPath) {
          logger.info(
            "[S3FileSync] Archivo Pending con finalPath - actualizando a Listo",
            {
              archivoId: archivo.id,
              finalPath: archivo.finalPath,
              ordenReparacionId: archivo.ordenReparacionId,
              reciboORepId: archivo.reciboORepId,
              reparacionDeTerceroId: archivo.reparacionDeTerceroId,
              accion: "UPDATE_STATUS_TO_LISTO",
            }
          );
          await prisma.customFile.update({
            where: { id: archivo.id },
            data: {
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
            },
          });
          continue;
        }

        // Determinar la carpeta de destino basada en las relaciones
        let folder = "archivos";
        let entidad = "ninguna";
        if (archivo.ordenReparacionId) {
          folder = "scanner";
          entidad = "ordenReparacion";
        } else if (archivo.reciboORepId) {
          folder = "recibos";
          entidad = "reciboORep";
        } else if (archivo.reparacionDeTerceroId) {
          folder = "recibos";
          entidad = "reparacionDeTercero";
        }

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

        logger.info("[S3FileSync] Archivo Pending movido exitosamente", {
          archivoId: archivo.id,
          tempPath: archivo.tempPath,
          finalPath,
          folder,
          entidad,
          ordenReparacionId: archivo.ordenReparacionId,
          reciboORepId: archivo.reciboORepId,
          reparacionDeTerceroId: archivo.reparacionDeTerceroId,
          accion: "MOVE_TEMP_TO_FINAL",
        });
      } catch (error) {
        logger.error("[S3FileSync] Error al procesar archivo Pending", {
          archivoId: archivo.id,
          tempPath: archivo.tempPath,
          finalPath: archivo.finalPath,
          ordenReparacionId: archivo.ordenReparacionId,
          reciboORepId: archivo.reciboORepId,
          reparacionDeTerceroId: archivo.reparacionDeTerceroId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("[S3FileSync] Error general al procesar archivos Pending", {
      error,
    });
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
      try {
        // Eliminar del S3 si tiene finalPath
        if (archivo.finalPath) {
          await fileStorage.removeFile(archivo.finalPath);
          logger.info("[S3FileSync] Archivo Borrado eliminado de S3", {
            archivoId: archivo.id,
            finalPath: archivo.finalPath,
            ordenReparacionId: archivo.ordenReparacionId,
            reciboORepId: archivo.reciboORepId,
            reparacionDeTerceroId: archivo.reparacionDeTerceroId,
            accion: "DELETE_FROM_S3",
          });
        }

        // Eliminar el registro de la base de datos
        await prisma.customFile.delete({
          where: { id: archivo.id },
        });

        logger.info(
          "[S3FileSync] Registro de archivo Borrado eliminado de BD",
          {
            archivoId: archivo.id,
            accion: "DELETE_FROM_DB",
          }
        );
      } catch (error) {
        logger.error("[S3FileSync] Error al eliminar archivo Borrado", {
          archivoId: archivo.id,
          finalPath: archivo.finalPath,
          ordenReparacionId: archivo.ordenReparacionId,
          reciboORepId: archivo.reciboORepId,
          reparacionDeTerceroId: archivo.reparacionDeTerceroId,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("[S3FileSync] Error general al eliminar archivos Borrado", {
      error,
    });
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
    logger.error("[S3FileSync] Error crítico durante la sincronización", {
      error,
    });
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
