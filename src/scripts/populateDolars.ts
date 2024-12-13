import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Iniciando actualizaciones...");
    // Obtener todos los registros que necesitan actualización
    const ventas = await prisma.venta.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fecha: true,
      },
    });

    const ingresosPorReparacion = await prisma.ingresoPorReparacion.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fecha: true,
      },
    });

    const extracciones = await prisma.extraccion.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fecha: true,
      },
    });

    const gastos = await prisma.gasto.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fecha: true,
      },
    });

    const ingresosManuales = await prisma.ingresoManualDeDinero.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fecha: true,
      },
    });

    const ordenesReparacion = await prisma.ordenReparacion.findMany({
      where: {
        dolarId: null,
      },
      select: {
        id: true,
        fechaCreacion: true,
      },
    });

    // Función para obtener el dólar correspondiente a una fecha
    const getDolarForDate = async (fecha: Date) => {
      return await prisma.dolar.findFirst({
        where: {
          fecha: {
            lte: fecha,
          },
        },
        orderBy: {
          fecha: "desc",
        },
        select: {
          id: true,
        },
      });
    };

    // Procesar cada registro y obtener su dólar correspondiente
    const ventasUpdates = await Promise.all(
      ventas.map(async (venta) => {
        const dolar = await getDolarForDate(venta.fecha);
        return prisma.venta.update({
          where: { id: venta.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    const ingresosReparacionUpdates = await Promise.all(
      ingresosPorReparacion.map(async (ingreso) => {
        const dolar = await getDolarForDate(ingreso.fecha);
        return prisma.ingresoPorReparacion.update({
          where: { id: ingreso.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    const extraccionesUpdates = await Promise.all(
      extracciones.map(async (extraccion) => {
        const dolar = await getDolarForDate(extraccion.fecha);
        return prisma.extraccion.update({
          where: { id: extraccion.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    const gastosUpdates = await Promise.all(
      gastos.map(async (gasto) => {
        const dolar = await getDolarForDate(gasto.fecha);
        return prisma.gasto.update({
          where: { id: gasto.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    const ingresosManualesUpdates = await Promise.all(
      ingresosManuales.map(async (ingreso) => {
        const dolar = await getDolarForDate(ingreso.fecha);
        return prisma.ingresoManualDeDinero.update({
          where: { id: ingreso.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    const ordenesReparacionUpdates = await Promise.all(
      ordenesReparacion.map(async (orden) => {
        const dolar = await getDolarForDate(orden.fechaCreacion);
        return prisma.ordenReparacion.update({
          where: { id: orden.id },
          data: { dolarId: dolar?.id },
        });
      })
    );

    await Promise.all([
      ...ventasUpdates,
      ...ingresosReparacionUpdates,
      ...extraccionesUpdates,
      ...gastosUpdates,
      ...ingresosManualesUpdates,
      ...ordenesReparacionUpdates,
    ]);

    console.log("Actualizaciones completadas");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
