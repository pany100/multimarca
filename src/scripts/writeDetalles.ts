import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando actualización de detalles de controles...");

    const ordenesReparacion = await prisma.ordenReparacion.findMany({
      include: {
        controlesEnReparacion: true,
      },
    });

    for (const orden of ordenesReparacion) {
      const detalles = [];

      for (const control of orden.controlesEnReparacion) {
        if (control.detalle && control.detalle.trim() !== "") {
          detalles.push(control.detalle);
        }
      }

      if (detalles.length > 0) {
        await prisma.ordenReparacion.update({
          where: {
            id: orden.id,
          },
          data: {
            detalleControles: JSON.stringify(detalles),
          },
        });
      }
    }

    console.log("Actualización completada");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
