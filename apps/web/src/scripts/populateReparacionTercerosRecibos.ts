import { EstadoArchivo, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(
      "Iniciando migración de recibos de ReparacionDeTercero a CustomFile..."
    );

    // Obtener todas las órdenes de reparación que tienen reparaciones de tercero con recibo no nulo
    const ordenesConReparacionesTercero = await prisma.ordenReparacion.findMany(
      {
        where: {
          reparacionesDeTercero: {
            some: {
              recibo: {
                not: null,
              },
              reciboFile: null, // Solo las que aún no tienen un CustomFile asociado
            },
          },
        },
        include: {
          reparacionesDeTercero: {
            where: {
              recibo: {
                not: null,
              },
              reciboFile: null,
            },
            select: {
              id: true,
              recibo: true,
              reciboFile: true,
            },
          },
        },
      }
    );

    console.log(
      `Se encontraron ${ordenesConReparacionesTercero.length} órdenes de reparación con reparaciones de tercero que tienen recibos para migrar`
    );

    // Contador para el total de reparaciones procesadas
    let totalReparacionesProcesadas = 0;

    // Procesar cada orden de reparación
    for (const orden of ordenesConReparacionesTercero) {
      console.log(
        `Procesando Orden de Reparación ID ${orden.id} con ${orden.reparacionesDeTercero.length} reparaciones de tercero`
      );

      // Procesar cada reparación de tercero dentro de la orden
      for (const reparacion of orden.reparacionesDeTercero) {
        try {
          if (!reparacion.recibo || reparacion.recibo.trim() === "") {
            console.log(
              `Reparación ID ${reparacion.id}: Recibo vacío, se omite`
            );
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

          totalReparacionesProcesadas++;
        } catch (error) {
          console.error(
            `Error al procesar ReparacionDeTercero ID ${reparacion.id}:`,
            error
          );
        }
      }
    }

    console.log(
      `Migración completada. Total de reparaciones procesadas: ${totalReparacionesProcesadas}`
    );
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
