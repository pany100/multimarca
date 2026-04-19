import { EstadisticasProveedoresService } from "@/core/infrastructure/database/queries/estadisticas-proveedores.service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function previousPeriod(from: Date | undefined, to: Date | undefined) {
  if (!from || !to) return { prevFrom: undefined, prevTo: undefined };
  const diffMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 86_400_000); // day before current from
  const prevFrom = new Date(prevTo.getTime() - diffMs);
  return { prevFrom, prevTo };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    const service = new EstadisticasProveedoresService();
    const { prevFrom, prevTo } = previousPeriod(from, to);

    const [kpis, kpisPrev, topProveedores, composicion, evolucion] =
      await Promise.all([
        service.getTotalProveedores(from, to),
        prevFrom && prevTo
          ? service.getTotalProveedores(prevFrom, prevTo)
          : Promise.resolve(null),
        service.getTopProveedores(from, to),
        service.getComposicion(from, to),
        service.getEvolucion(to),
      ]);

    const cantProveedores = topProveedores.length;

    return NextResponse.json({
      kpis: {
        totalComprado: kpis.totalGlobal,
        ordenesCompra: kpis.cantidadOrdenesCompra,
        reparacionesTercero:
          kpis.cantidadReparacionesTerceroOrden +
          kpis.cantidadReparacionesTerceroVenta,
        promedioPorProveedor:
          cantProveedores > 0 ? kpis.totalGlobal / cantProveedores : 0,
      },
      kpisPrev: kpisPrev
        ? {
            totalComprado: kpisPrev.totalGlobal,
            ordenesCompra: kpisPrev.cantidadOrdenesCompra,
            reparacionesTercero:
              kpisPrev.cantidadReparacionesTerceroOrden +
              kpisPrev.cantidadReparacionesTerceroVenta,
            promedioPorProveedor:
              cantProveedores > 0
                ? kpisPrev.totalGlobal / cantProveedores
                : 0,
          }
        : null,
      topProveedores,
      composicion,
      evolucion,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
