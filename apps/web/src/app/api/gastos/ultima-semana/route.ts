import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import {
  checkUserPermission,
  getReparacionesTerminadasForMecanico,
  getWeekDateRange,
} from "src/utils/gastosUtils";

export async function GET(request: Request) {
  try {
    const checkPermissionError = await checkUserPermission(request);
    if (checkPermissionError) {
      return checkPermissionError;
    }

    const { startDate, endDate } = getWeekDateRange(request);

    const mecanicos = await prisma.empleado.findMany({
      where: {
        tipo: "Mecanico",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // For each mechanic, get their repair orders from the specified date range
    const result = await Promise.all(
      mecanicos.map(async (mecanico) => {
        const ordenesReparacion = await getReparacionesTerminadasForMecanico(
          startDate,
          endDate,
          mecanico.id
        );
        const ordenesReparacionUnicoMecanico = ordenesReparacion.filter(
          (reparacion) => reparacion.mecanicos.length === 1
        );

        // Calculate manoDeObra for each repair order and total for the mechanic
        const reparaciones = await Promise.all(
          ordenesReparacionUnicoMecanico.map(async (orden) => {
            // Calculate total manoDeObra for this repair order
            const manoDeObra = orden.trabajosRealizados.reduce(
              (total, trabajo) => total + Number(trabajo.precioUnitario),
              0
            );

            // Check if the repair order has been paid
            const pagado = orden.pagos.some(
              (pago) => pago.fechaPago !== null && pago.monto !== null
            );

            return {
              idOrep: orden.id,
              fecha: orden.fechaSalidaReparacion,
              auto: orden.auto.patent,
              manoDeObra,
              pagado,
            };
          })
        );

        // Calculate total manoDeObra for all repair orders
        const manoDeObraTotal = reparaciones.reduce(
          (total, reparacion) => total + reparacion.manoDeObra,
          0
        );

        // Calculate total manoDeObra for paid repair orders
        const manoDeObraPagada = reparaciones.reduce(
          (total, reparacion) =>
            total + (reparacion.pagado ? reparacion.manoDeObra : 0),
          0
        );

        return {
          mecanicoId: mecanico.id,
          mecanicoNombre: mecanico.name,
          reparaciones,
          manoDeObraTotal,
          manoDeObraPagada,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener datos de mecánicos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
