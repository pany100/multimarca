import { EstadoArchivo, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando migración de recibos a CustomFile...");

    // Obtener todas las órdenes de reparación con recibos no nulos
    const ordenesConRecibos = await prisma.ordenReparacion.findMany({
      where: {
        recibos: {
          not: Prisma.JsonNull,
        },
      },
      select: {
        id: true,
        recibos: true,
        recibosFiles: true,
      },
    });

    console.log(
      `Se encontraron ${ordenesConRecibos.length} órdenes con recibos para migrar`
    );

    // Procesar cada orden
    for (const orden of ordenesConRecibos) {
      try {
        // Verificar si recibos es un array de strings
        const recibosArray = orden.recibos
          ? typeof orden.recibos === "string"
            ? JSON.parse(orden.recibos)
            : (orden.recibos as string[])
          : [];

        if (!Array.isArray(recibosArray) || recibosArray.length === 0) {
          console.log(
            `Orden ID ${orden.id}: No tiene recibos válidos para migrar`
          );
          continue;
        }

        console.log(
          `Orden ID ${orden.id}: Procesando ${recibosArray.length} recibos`
        );

        // Crear un CustomFile para cada recibo
        for (const reciboPath of recibosArray) {
          if (
            !reciboPath ||
            typeof reciboPath !== "string" ||
            reciboPath.trim() === ""
          ) {
            continue;
          }

          // Verificar si ya existe un CustomFile para este recibo
          const existingFiles = orden.recibosFiles || [];
          const alreadyExists = existingFiles.some(
            (file) =>
              file.tempPath === reciboPath || file.finalPath === reciboPath
          );

          if (alreadyExists) {
            console.log(
              `Orden ID ${orden.id}: Recibo ${reciboPath} ya está migrado`
            );
            continue;
          }

          // Crear el nuevo CustomFile
          const customFile = await prisma.customFile.create({
            data: {
              tempPath: reciboPath,
              finalPath: reciboPath,
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
              reciboORepId: orden.id,
            },
          });

          console.log(
            `Orden ID ${orden.id}: Creado CustomFile ID ${customFile.id} para recibo ${reciboPath}`
          );
        }
      } catch (error) {
        console.error(
          `Error al procesar OrdenReparacion ID ${orden.id}:`,
          error
        );
      }
    }

    console.log("Migración de recibos completada");
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
