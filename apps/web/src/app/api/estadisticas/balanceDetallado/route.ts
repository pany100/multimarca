import {
  addDays,
  getDefaultDateRange,
  getDetalleOrdenes,
  getEvolucionCaja,
  getEvolucionRentabilidad,
  getFlujoCaja,
  getGastosPorCategoria,
  getKpisRentabilidad,
  getPreviousRange,
  getTiposOperacion,
  getComposicionFacturacion,
} from "@/core/infrastructure/database/queries/financiero.query-service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const defaults = getDefaultDateRange();
    const from = fromParam || defaults.from;
    const to = toParam ? addDays(toParam, 1) : defaults.to;

    const prev = getPreviousRange(from, to);

    const [
      rentabilidad,
      rentabilidadPrev,
      detalle,
      evolucionRentabilidad,
      flujoCaja,
      flujoCajaPrev,
      categorias,
      tiposOp,
      evolucionCaja,
      composicion,
    ] = await Promise.all([
      getKpisRentabilidad(from, to),
      getKpisRentabilidad(prev.from, prev.to),
      getDetalleOrdenes(from, to),
      getEvolucionRentabilidad(to),
      getFlujoCaja(from, to),
      getFlujoCaja(prev.from, prev.to),
      getGastosPorCategoria(from, to),
      getTiposOperacion(from, to),
      getEvolucionCaja(to),
      getComposicionFacturacion(from, to),
    ]);

    return NextResponse.json({
      rentabilidad: {
        kpis: rentabilidad,
        kpisPrev: rentabilidadPrev,
        detalle,
        evolucion: evolucionRentabilidad,
        composicion,
      },
      flujoCaja: {
        kpis: flujoCaja,
        kpisPrev: flujoCajaPrev,
        categorias,
        tiposOperacion: tiposOp,
        evolucion: evolucionCaja,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
