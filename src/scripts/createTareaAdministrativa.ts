import { PrismaClient } from "@prisma/client";

async function createTareasAdministrativas() {
  const prisma = new PrismaClient();

  try {
    console.log("Iniciando creación de tareas administrativas...");

    // Obtener todos los presupuestos
    const presupuestos = await prisma.presupuesto.findMany({
      select: {
        id: true,
        administrativoId: true,
        creadorId: true,
      },
    });

    console.log(
      `Se encontraron ${presupuestos.length} presupuestos para procesar`
    );

    // Crear tareas administrativas para cada presupuesto
    const tareasCreadas = [];

    for (const presupuesto of presupuestos) {
      // Crear tarea para el administrativo
      if (presupuesto.administrativoId) {
        const tareaAdministrativo = await prisma.tareaAdministrativa.create({
          data: {
            descripcion: "Ingresa",
            presupuestoId: presupuesto.id,
            usuarioId: presupuesto.administrativoId,
          },
        });
        tareasCreadas.push(tareaAdministrativo);
        console.log(
          `Creada tarea administrativa para administrativoId: ${presupuesto.administrativoId}, presupuestoId: ${presupuesto.id}`
        );
      }

      // Crear tarea para el creador si existe y es diferente del administrativo
      if (presupuesto.creadorId) {
        const tareaCreador = await prisma.tareaAdministrativa.create({
          data: {
            descripcion: "Crea",
            presupuestoId: presupuesto.id,
            usuarioId: presupuesto.creadorId,
          },
        });
        tareasCreadas.push(tareaCreador);
        console.log(
          `Creada tarea administrativa para creadorId: ${presupuesto.creadorId}, presupuestoId: ${presupuesto.id}`
        );
      }
    }

    console.log(
      `Se crearon ${tareasCreadas.length} tareas administrativas en total`
    );
    console.log("Proceso completado con éxito");
  } catch (error) {
    console.error(
      "Error durante la creación de tareas administrativas:",
      error
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createTareasAdministrativas()
  .then(() => {
    console.log("Script finalizado correctamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en el script:", error);
    process.exit(1);
  });
