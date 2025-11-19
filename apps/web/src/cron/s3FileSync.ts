import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { EstadoArchivo, PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
const fileStorage = new S3FileStorageAdapter();

/**
 * Elimina archivos huérfanos (sin relaciones) del S3 y de la base de datos
 */
async function limpiarArchivosHuerfanos() {
  try {
    console.log(`[${new Date().toISOString()}] Buscando archivos huérfanos...`);

    const archivosHuerfanos = await prisma.customFile.findMany({
      where: {
        ordenReparacionId: null,
        reciboORepId: null,
        reparacionDeTerceroId: null,
      },
    });

    console.log(
      `Se encontraron ${archivosHuerfanos.length} archivos huérfanos`
    );

    for (const archivo of archivosHuerfanos) {
      try {
        console.log(`Procesando archivo huérfano ID ${archivo.id}`);
        // Si tiene finalPath, eliminar del S3
        if (archivo.finalPath) {
          await fileStorage.removeFile(archivo.finalPath);
          console.log(`Archivo eliminado de S3: ${archivo.finalPath}`);
        }

        // Eliminar el registro de la base de datos
        await prisma.customFile.delete({
          where: { id: archivo.id },
        });

        console.log(`Registro de archivo huérfano eliminado: ID ${archivo.id}`);
      } catch (error) {
        console.error(
          `Error al eliminar archivo huérfano ID ${archivo.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al limpiar archivos huérfanos:", error);
  }
}

/**
 * Procesa archivos con estado Error, intentando subirlos nuevamente
 */
async function procesarArchivosConError() {
  try {
    console.log(
      `[${new Date().toISOString()}] Procesando archivos con estado Error...`
    );

    const archivosConError = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Error,
      },
    });

    console.log(
      `Se encontraron ${archivosConError.length} archivos con estado Error`
    );

    for (const archivo of archivosConError) {
      try {
        if (!archivo.tempPath) {
          console.log(`Archivo ID ${archivo.id} no tiene tempPath, omitiendo`);
          continue;
        }

        if (archivo.finalPath) {
          console.log(
            `Archivo ID ${archivo.id} tiene finalPath, actualizando status to Listo`
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
        if (archivo.ordenReparacionId) folder = "scanner";
        else if (archivo.reciboORepId) folder = "recibos";
        else if (archivo.reparacionDeTerceroId) folder = "recibos";

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

        console.log(
          `Archivo ID ${archivo.id} movido correctamente: ${finalPath}`
        );
      } catch (error) {
        console.error(
          `Error al procesar archivo con error ID ${archivo.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al procesar archivos con estado Error:", error);
  }
}

/**
 * Procesa archivos con estado Pending
 */
async function procesarArchivosPending() {
  try {
    console.log(
      `[${new Date().toISOString()}] Procesando archivos con estado Pending...`
    );

    const archivosPending = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Pendiente,
      },
    });

    console.log(
      `Se encontraron ${archivosPending.length} archivos con estado Pending`
    );

    for (const archivo of archivosPending) {
      try {
        if (!archivo.tempPath) {
          console.log(
            `Archivo ID ${archivo.id} no tiene tempPath, omitiendo, estado corrupto`
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
          console.log(
            `Archivo ID ${archivo.id} tiene finalPath, actualizando status to Listo`
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
        if (archivo.ordenReparacionId) folder = "scanner";
        else if (archivo.reciboORepId) folder = "recibos";
        else if (archivo.reparacionDeTerceroId) folder = "recibos";

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

        console.log(
          `Archivo ID ${archivo.id} movido correctamente: ${finalPath}`
        );
      } catch (error) {
        console.error(
          `Error al procesar archivo con error ID ${archivo.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al procesar archivos con estado Error:", error);
  }
}

/**
 * Elimina archivos marcados como borrados
 */
async function eliminarArchivosBorrados() {
  try {
    console.log(
      `[${new Date().toISOString()}] Eliminando archivos marcados como borrados...`
    );

    const archivosBorrados = await prisma.customFile.findMany({
      where: {
        status: EstadoArchivo.Borrado,
      },
    });

    console.log(
      `Se encontraron ${archivosBorrados.length} archivos marcados como borrados`
    );

    for (const archivo of archivosBorrados) {
      try {
        // Eliminar del S3 si tiene finalPath
        if (archivo.finalPath) {
          await fileStorage.removeFile(archivo.finalPath);
          console.log(`Archivo eliminado de S3: ${archivo.finalPath}`);
        }

        // Eliminar el registro de la base de datos
        await prisma.customFile.delete({
          where: { id: archivo.id },
        });

        console.log(`Registro de archivo borrado eliminado: ID ${archivo.id}`);
      } catch (error) {
        console.error(
          `Error al eliminar archivo borrado ID ${archivo.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error al eliminar archivos borrados:", error);
  }
}

/**
 * Ejecuta todas las tareas de sincronización de archivos
 */
async function sincronizarArchivos() {
  console.log(
    `[${new Date().toISOString()}] Iniciando sincronización de archivos S3...`
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

    console.log(
      `[${new Date().toISOString()}] Sincronización de archivos S3 completada`
    );
  } catch (error) {
    console.error("Error durante la sincronización de archivos S3:", error);
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

  console.log("Cron job para sincronización de archivos S3 iniciado");
}

// Ejecutar inmediatamente al iniciar la aplicación (opcional)
// sincronizarArchivos();
