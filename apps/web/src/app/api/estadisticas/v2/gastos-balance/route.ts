import {
  getCobrado,
  getDefaultDateRange,
  getEvolucionCaja,
  getGastosOperativos,
  getGastosPorCategoria,
  getPreviousRange,
  getTiposOperacion,
} from "@/core/infrastructure/database/queries/financiero.query-service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const defaults = getDefaultDateRange();
    const from = defaults.from;
    const to = defaults.to;
    const prev = getPreviousRange(from, to);

    const [cobrado, cobradoPrev, gastos, gastosPrev, categorias, tiposOp, evolucion] = await Promise.all([
      getCobrado(from, to),
      getCobrado(prev.from, prev.to),
      getGastosOperativos(from, to),
      getGastosOperativos(prev.from, prev.to),
      getGastosPorCategoria(from, to),
      getTiposOperacion(from, to),
      getEvolucionCaja(to),
    ]);

    return NextResponse.json({
      kpis: { cobrado, gastos, balance: cobrado - gastos },
      kpisPrev: { cobrado: cobradoPrev, gastos: gastosPrev, balance: cobradoPrev - gastosPrev },
      categorias,
      tiposOperacion: tiposOp,
      evolucion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
