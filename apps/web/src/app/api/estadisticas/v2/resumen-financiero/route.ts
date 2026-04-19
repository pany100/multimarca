import {
  addDays,
  getDefaultDateRange,
  getDetalleOrdenes,
  getEvolucionRentabilidad,
  getKpisRentabilidad,
  getPreviousRange,
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

    const [kpis, kpisPrev, detalle, evolucion] = await Promise.all([
      getKpisRentabilidad(from, to),
      getKpisRentabilidad(prev.from, prev.to),
      getDetalleOrdenes(from, to),
      getEvolucionRentabilidad(to),
    ]);

    return NextResponse.json({
      kpis,
      kpisPrev,
      detalle,
      evolucion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
