import prisma from "src/lib/prisma";

export async function sincronizarControles() {
  try {
    // Obtener todas las órdenes de reparación existentes
    const ordenesReparacion = await prisma.ordenReparacion.findMany();

    // Obtener todos los controles mecánicos existentes de tipo checkbox o texto
    const controlesMecanicos = await prisma.controlMecanico.findMany({
      where: {
        type: {
          in: ["checkbox", "texto"],
        },
      },
    });

    // Obtener los controles en reparación existentes
    const controlesEnReparacionExistentes =
      await prisma.controlEnReparacion.findMany({
        select: {
          ordenReparacionId: true,
          controlMecanicoId: true,
        },
      });

    // Crear array con combinaciones faltantes
    const controlesACrear = [];

    for (const orden of ordenesReparacion) {
      for (const controlMecanico of controlesMecanicos) {
        const existe = controlesEnReparacionExistentes.some(
          (c) =>
            c.ordenReparacionId === orden.id &&
            c.controlMecanicoId === controlMecanico.id
        );

        if (!existe) {
          controlesACrear.push({
            ordenReparacionId: orden.id,
            controlMecanicoId: controlMecanico.id,
            valor: "",
            detalle: "",
          });
        }
      }
    }

    // Crear los controles faltantes
    if (controlesACrear.length > 0) {
      await prisma.controlEnReparacion.createMany({
        data: controlesACrear,
      });
    }

    return controlesACrear.length;
  } catch (error) {
    console.error("Error al sincronizar controles:", error);
    throw error;
  }
}
