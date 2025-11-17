import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeDuplicateRecordatorios() {
  try {
    console.log("Iniciando búsqueda de recordatorios duplicados...");

    // Obtener todos los recordatorios NO recurrentes
    const recordatorios = await prisma.recordatorioAgenda.findMany({
      where: {
        recurrence: "No",
      },
      orderBy: [
        { titulo: "asc" },
        { descripcion: "asc" },
        { fecha: "asc" },
        { id: "asc" },
      ],
    });

    console.log(
      `Total de recordatorios no recurrentes: ${recordatorios.length}`
    );

    // Agrupar por título, descripción y fecha
    const grupos = new Map<string, number[]>();

    for (const recordatorio of recordatorios) {
      const key = `${recordatorio.titulo}|${
        recordatorio.descripcion || ""
      }|${recordatorio.fecha.toISOString()}`;

      if (!grupos.has(key)) {
        grupos.set(key, []);
      }

      grupos.get(key)!.push(recordatorio.id);
    }

    // Filtrar solo los grupos con duplicados
    const duplicados = Array.from(grupos.entries()).filter(
      ([_, ids]) => ids.length > 1
    );

    console.log(`Grupos con duplicados encontrados: ${duplicados.length}`);

    if (duplicados.length === 0) {
      console.log("No se encontraron duplicados.");
      return;
    }

    // Para cada grupo de duplicados, eliminar todos menos el último (mayor ID)
    let totalEliminados = 0;

    for (const [key, ids] of duplicados) {
      // Ordenar IDs y obtener todos menos el último
      const sortedIds = ids.sort((a, b) => a - b);
      const idsToDelete = sortedIds.slice(0, -1); // Todos menos el último
      const keepId = sortedIds[sortedIds.length - 1]; // El último (mayor ID)

      console.log(`\nGrupo: ${key.split("|")[0]}`);
      console.log(`  Total: ${ids.length} duplicados`);
      console.log(`  Manteniendo ID: ${keepId}`);
      console.log(`  Eliminando IDs: ${idsToDelete.join(", ")}`);

      // Eliminar los duplicados
      const result = await prisma.recordatorioAgenda.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });

      totalEliminados += result.count;
      console.log(`  Eliminados: ${result.count}`);
    }

    console.log(
      `\n✅ Proceso completado. Total de recordatorios eliminados: ${totalEliminados}`
    );
  } catch (error) {
    console.error("❌ Error al eliminar duplicados:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
removeDuplicateRecordatorios()
  .then(() => {
    console.log("Script finalizado exitosamente.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
