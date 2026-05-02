import {
  addDays,
  getComprasRepuestosPeriodo,
  getDefaultDateRange,
  getGananciaIvaPeriodo,
  getPreviousRange,
  getSobranteIvaDescuentoPeriodo,
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
      comprasRepuestos,
      comprasRepuestosPrev,
      gananciaIva,
      gananciaIvaPrev,
      sobranteIvaDescuento,
      sobranteIvaDescuentoPrev,
    ] = await Promise.all([
      getComprasRepuestosPeriodo(from, to),
      getComprasRepuestosPeriodo(prev.from, prev.to),
      getGananciaIvaPeriodo(from, to),
      getGananciaIvaPeriodo(prev.from, prev.to),
      getSobranteIvaDescuentoPeriodo(from, to),
      getSobranteIvaDescuentoPeriodo(prev.from, prev.to),
    ]);

    return NextResponse.json({
      comprasRepuestos,
      comprasRepuestosPrev,
      gananciaIva,
      gananciaIvaPrev,
      sobranteIvaDescuento,
      sobranteIvaDescuentoPrev,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
