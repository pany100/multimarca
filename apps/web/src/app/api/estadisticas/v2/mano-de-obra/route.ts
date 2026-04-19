import { EstadisticasManoDeObraService } from "@/core/infrastructure/database/queries/estadisticas-mano-de-obra.service";
import {
  getDefaultDateRange,
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
    const fromStr = fromParam || defaults.from;
    const toStr = toParam || defaults.to;
    const from = new Date(fromStr);
    const to = new Date(toStr);

    const prev = getPreviousRange(fromStr, toStr);
    const prevFrom = new Date(prev.from);
    const prevTo = new Date(prev.to);

    const service = new EstadisticasManoDeObraService();

    const [
      totalRows,
      totalPrevRows,
      topPorMonto,
      topPorFrecuencia,
      trabajoFrecuente,
      evolucion,
    ] = await Promise.all([
      service.getTotalManoDeObra(from, to),
      service.getTotalManoDeObra(prevFrom, prevTo),
      service.getTopManoDeObra(from, to),
      service.getTopPorFrecuencia(from, to),
      service.getTrabajoMasFrecuente(from, to),
      service.getEvolucionMensual(),
    ]);

    const total = totalRows?.[0];
    const totalPrev = totalPrevRows?.[0];

    const totalMdO = Number(total?.totalGlobalManoDeObra ?? 0);
    const cantOrdenes = Number(total?.cantidadOrdenes ?? 0);
    const promedioOrden = cantOrdenes > 0 ? totalMdO / cantOrdenes : 0;

    const totalMdOPrev = Number(totalPrev?.totalGlobalManoDeObra ?? 0);
    const cantOrdenesPrev = Number(totalPrev?.cantidadOrdenes ?? 0);
    const promedioPrev =
      cantOrdenesPrev > 0 ? totalMdOPrev / cantOrdenesPrev : 0;

    return NextResponse.json({
      kpis: {
        totalMdO,
        promedioOrden,
        cantidadOrdenes: cantOrdenes,
        trabajoMasFrecuente: trabajoFrecuente,
      },
      kpisPrev: {
        totalMdO: totalMdOPrev,
        promedioOrden: promedioPrev,
        cantidadOrdenes: cantOrdenesPrev,
      },
      topPorMonto: topPorMonto.map((r) => ({
        descripcion: r.descripcion,
        total: Number(r.totalPorTrabajo),
        cantidadOrdenes: Number(r.cantidadOrdenes),
      })),
      topPorFrecuencia: topPorFrecuencia.map((r) => ({
        descripcion: r.descripcion,
        total: Number(r.totalPorTrabajo),
        cantidadOrdenes: Number(r.cantidadOrdenes),
      })),
      evolucion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
