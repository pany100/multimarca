import { EstadoArchivo, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(
      "Iniciando migración de recibos de ReparacionDeTercero a CustomFile..."
    );

    // Obtener todas las reparaciones de tercero con recibo no nulo
    const reparacionesConRecibo = await prisma.reparacionDeTercero.findMany({
      where: {
        recibo: {
          not: null,
        },
        reciboFile: null, // Solo las que aún no tienen un CustomFile asociado
      },
      select: {
        id: true,
        recibo: true,
        reciboFile: true,
      },
    });

    console.log(
      `Se encontraron ${reparacionesConRecibo.length} reparaciones con recibo para migrar`
    );

    // Procesar cada reparación
    for (const reparacion of reparacionesConRecibo) {
      try {
        if (!reparacion.recibo || reparacion.recibo.trim() === "") {
          console.log(`Reparación ID ${reparacion.id}: Recibo vacío, se omite`);
          continue;
        }

        console.log(
          `Reparación ID ${reparacion.id}: Procesando recibo ${reparacion.recibo}`
        );

        // Crear el nuevo CustomFile
        const customFile = await prisma.customFile.create({
          data: {
            tempPath: reparacion.recibo,
            finalPath: reparacion.recibo,
            status: EstadoArchivo.Listo,
            promotedAt: new Date(),
            reparacionDeTerceroId: reparacion.id,
          },
        });

        console.log(
          `Reparación ID ${reparacion.id}: Creado CustomFile ID ${customFile.id} para recibo ${reparacion.recibo}`
        );
      } catch (error) {
        console.error(
          `Error al procesar ReparacionDeTercero ID ${reparacion.id}:`,
          error
        );
      }
    }

    console.log("Migración de recibos de ReparacionDeTercero completada");
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
