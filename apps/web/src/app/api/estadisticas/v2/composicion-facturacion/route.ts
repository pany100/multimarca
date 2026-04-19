import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ComposicionRow {
  repuestos: number;
  mano_de_obra: number;
  terceros: number;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getDefaultRange() {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
  const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
  const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { from, to };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const defaults = getDefaultRange();
    const from = fromParam || defaults.from;
    const to = toParam ? addDays(toParam, 1) : defaults.to;

    const rows = await prisma.$queryRaw<ComposicionRow[]>`
      SELECT
        COALESCE(SUM(sub.repuestos), 0) AS repuestos,
        COALESCE(SUM(sub.mano_de_obra), 0) AS mano_de_obra,
        COALESCE(SUM(sub.terceros), 0) AS terceros
      FROM (
        SELECT
          COALESCE(rep_v.total, 0) AS repuestos,
          COALESCE(trab.total, 0) + COALESCE(o.incrementoInterno, 0) AS mano_de_obra,
          COALESCE(ter_v.total, 0) AS terceros
        FROM OrdenReparacion o
        LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM RepuestoUsado r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) rep_v ON rep_v.ordenReparacionId=o.id
        LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM ReparacionDeTercero r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_v ON ter_v.ordenReparacionId=o.id
        LEFT JOIN (SELECT ordenReparacionId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ordenReparacionId IS NOT NULL GROUP BY t.ordenReparacionId) trab ON trab.ordenReparacionId=o.id
        WHERE o.estado IN ('Terminado','SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}

        UNION ALL

        SELECT
          COALESCE(rep_v.total, 0) AS repuestos,
          COALESCE(trab.total, 0) AS mano_de_obra,
          COALESCE(ter_v.total, 0) AS terceros
        FROM Venta v
        LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM RepuestoUsado r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) rep_v ON rep_v.ventaId=v.id
        LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM ReparacionDeTercero r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_v ON ter_v.ventaId=v.id
        LEFT JOIN (SELECT ventaId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId) trab ON trab.ventaId=v.id
        WHERE v.estado IN ('Entregado','Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to}
      ) sub
    `;

    return NextResponse.json({
      repuestos: Number(rows[0]?.repuestos ?? 0),
      manoDeObra: Number(rows[0]?.mano_de_obra ?? 0),
      terceros: Number(rows[0]?.terceros ?? 0),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
