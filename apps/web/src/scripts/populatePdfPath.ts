import { EstadoArchivo, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando migración de PDF paths a CustomFile...");

    // Obtener todas las órdenes de reparación con pdfPath no nulo
    const ordenesConPdf = await prisma.ordenReparacion.findMany({
      where: {
        pdfPath: {
          not: null,
        },
        scannerFile: null,
      },
      select: {
        id: true,
        pdfPath: true,
      },
    });

    console.log(
      `Se encontraron ${ordenesConPdf.length} órdenes con PDF para migrar`
    );

    // Crear CustomFile y actualizar OrdenReparacion para cada registro
    const updates = await Promise.all(
      ordenesConPdf.map(async (orden) => {
        if (!orden.pdfPath) return null; // Verificación adicional

        try {
          // Crear el nuevo CustomFile
          const customFile = await prisma.customFile.create({
            data: {
              tempPath: orden.pdfPath,
              finalPath: orden.pdfPath,
              status: EstadoArchivo.Listo,
              promotedAt: new Date(),
              ordenReparacion: {
                connect: {
                  id: orden.id,
                },
              },
            },
          });

          console.log(
            `Creado CustomFile ID ${customFile.id} para OrdenReparacion ID ${orden.id}`
          );

          return customFile;
        } catch (error) {
          console.error(
            `Error al procesar OrdenReparacion ID ${orden.id}:`,
            error
          );
          return null;
        }
      })
    );

    // Filtrar posibles nulos
    const completedUpdates = updates.filter((update) => update !== null);

    console.log(
      `Migración completada. Se crearon ${completedUpdates.length} registros CustomFile`
    );
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
