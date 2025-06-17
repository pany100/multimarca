import { NextResponse } from "next/server";
import {
  checkUserPermission,
  getReparacionesMultiplesMecanicos,
  getWeekDateRange,
} from "src/utils/gastosUtils";

export async function GET(request: Request) {
  try {
    const checkPermissionError = await checkUserPermission(request);
    if (checkPermissionError) {
      return checkPermissionError;
    }

    const { startDate, endDate } = getWeekDateRange(request);

    // Get all repairs with multiple mechanics assigned
    const reparaciones = await getReparacionesMultiplesMecanicos(
      startDate,
      endDate
    );

    // Process and format the repairs data
    const result = reparaciones.map((reparacion) => {
      // Calculate total manoDeObra for this repair order
      const manoDeObraTotal = reparacion.trabajosRealizados.reduce(
        (total, trabajo) => total + Number(trabajo.precioUnitario),
        0
      );

      // Check if the repair order has been paid
      const pagado = reparacion.pagos.some(
        (pago) => pago.fechaPago !== null && pago.monto !== null
      );

      // Calculate total manoDeObra for paid repair orders
      const manoDeObraPagada = pagado ? manoDeObraTotal : 0;

      // Format mechanics list
      const mechanics = reparacion.mecanicos.map((rm) => ({
        id: rm.mecanico.id,
        name: rm.mecanico.name,
      }));

      return {
        id: reparacion.id,
        fecha: reparacion.fechaSalidaReparacion,
        auto: `${reparacion.auto.brand} ${reparacion.auto.model} (${reparacion.auto.patent})`,
        mechanics,
        manoDeObraTotal,
        manoDeObraPagada,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener datos de reparaciones compartidas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
