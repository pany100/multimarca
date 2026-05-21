import { GastosPorEmpleadoService } from "@/core/infrastructure/database/queries/gastos-por-empleado.service";
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

    const service = new GastosPorEmpleadoService();

    const [total, totalPrev, ranking, pivot, evolucion] = await Promise.all([
      service.getTotal(from, to),
      service.getTotal(prevFrom, prevTo),
      service.getRanking(from, to),
      service.getPivotPorCategoria(from, to),
      service.getEvolucionMensual(),
    ]);

    const rankingMapped = ranking.map((r) => ({
      empleadoId: Number(r.empleadoId),
      empleadoNombre: r.empleadoNombre ?? "Sin nombre",
      total: Number(r.total),
      cantidad: Number(r.cantidad),
    }));

    // Pivot { empleadoId -> { nombre, total, categorias: {cat: monto} } }
    const pivotMap = new Map<
      number,
      {
        empleadoId: number;
        empleadoNombre: string;
        total: number;
        cantidad: number;
        categorias: Record<string, number>;
      }
    >();
    const categoriasSet = new Set<string>();
    for (const r of pivot) {
      const id = Number(r.empleadoId);
      const cat = r.categoria ?? "Sin categoría";
      categoriasSet.add(cat);
      const monto = Number(r.total);
      const cant = Number(r.cantidad);
      const entry = pivotMap.get(id);
      if (entry) {
        entry.categorias[cat] = (entry.categorias[cat] ?? 0) + monto;
        entry.total += monto;
        entry.cantidad += cant;
      } else {
        pivotMap.set(id, {
          empleadoId: id,
          empleadoNombre: r.empleadoNombre ?? "Sin nombre",
          total: monto,
          cantidad: cant,
          categorias: { [cat]: monto },
        });
      }
    }
    const pivotRows = Array.from(pivotMap.values()).sort(
      (a, b) => b.total - a.total
    );
    const categorias = Array.from(categoriasSet).sort();

    const promedioPorEmpleado =
      total.empleados > 0 ? total.total / total.empleados : 0;
    const promedioPrev =
      totalPrev.empleados > 0 ? totalPrev.total / totalPrev.empleados : 0;

    return NextResponse.json({
      kpis: {
        total: total.total,
        cantidad: total.cantidad,
        empleados: total.empleados,
        promedioPorEmpleado,
      },
      kpisPrev: {
        total: totalPrev.total,
        cantidad: totalPrev.cantidad,
        empleados: totalPrev.empleados,
        promedioPorEmpleado: promedioPrev,
      },
      ranking: rankingMapped,
      pivot: {
        categorias,
        rows: pivotRows,
      },
      evolucion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
