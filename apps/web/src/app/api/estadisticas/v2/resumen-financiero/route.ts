import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface OrdenRow {
  id: number;
  tipo: string;
  fecha: Date;
  cliente_nombre: string | null;
  total_repuestos_venta: number;
  total_repuestos_costo: number;
  total_terceros_venta: number;
  total_terceros_costo: number;
  total_trabajos: number;
  incremento: number;
  incremento_interno: number;
  descuento: number;
  total_cliente: number;
  costo_taller: number;
  ganancia: number;
}

interface KpiRow {
  facturacion: number;
  costo: number;
  ganancia: number;
  cantidad: number;
}

interface EvolucionRow {
  label: string;
  facturacion: number;
  costo: number;
  ganancia: number;
}

function getDefaultRange() {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
  const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
  const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { from, to };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getPreviousRange(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffMs = toDate.getTime() - fromDate.getTime();
  const prevTo = from;
  const prevFromDate = new Date(fromDate.getTime() - diffMs);
  const prevFrom = prevFromDate.toISOString().split("T")[0];
  return { from: prevFrom, to: prevTo };
}

/**
 * Calcula facturación, costo y ganancia correctamente.
 *
 * - Facturación = repuestos(precioVenta) + terceros(precioVenta) + trabajos + incremento + incrementoInterno - descuento
 * - Costo = repuestos(precioCompra * unidades) + terceros(precioCompra)
 * - Ganancia = Facturación - Costo
 *
 * Solo OdR en estado Terminado/SeRetira y Ventas en estado Entregado/Cerrado.
 */
async function getKpis(from: string, to: string): Promise<KpiRow> {
  const rows = await prisma.$queryRaw<KpiRow[]>`
    SELECT
      COALESCE(SUM(sub.total_cliente), 0) AS facturacion,
      COALESCE(SUM(sub.costo_taller), 0) AS costo,
      COALESCE(SUM(sub.total_cliente - sub.costo_taller), 0) AS ganancia,
      COUNT(*) AS cantidad
    FROM (
      SELECT
        (
          COALESCE(rep_v.total, 0) + COALESCE(ter_v.total, 0) + COALESCE(trab.total, 0)
          + COALESCE(o.incremento, 0) + COALESCE(o.incrementoInterno, 0) - COALESCE(o.descuento, 0)
        ) AS total_cliente,
        (COALESCE(rep_c.total, 0) + COALESCE(ter_c.total, 0)) AS costo_taller
      FROM OrdenReparacion o
      LEFT JOIN (
        SELECT ordenReparacionId, SUM(
          CASE WHEN oRep.porcentajeRecargo = 0 THEN r.precioVenta
          ELSE CEIL(r.precioVenta * (1 + oRep.porcentajeRecargo / 100.0) / 500.0) * 500 END
        ) AS total FROM RepuestoUsado r
        JOIN OrdenReparacion oRep ON oRep.id = r.ordenReparacionId
        WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId
      ) rep_v ON rep_v.ordenReparacionId = o.id
      LEFT JOIN (
        SELECT ordenReparacionId, SUM(r.precioCompra * r.unidadesConsumidas) AS total
        FROM RepuestoUsado r WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId
      ) rep_c ON rep_c.ordenReparacionId = o.id
      LEFT JOIN (
        SELECT ordenReparacionId, SUM(
          CASE WHEN oRep.porcentajeRecargo = 0 THEN r.precioVenta
          ELSE CEIL(r.precioVenta * (1 + oRep.porcentajeRecargo / 100.0) / 500.0) * 500 END
        ) AS total FROM ReparacionDeTercero r
        JOIN OrdenReparacion oRep ON oRep.id = r.ordenReparacionId
        WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId
      ) ter_v ON ter_v.ordenReparacionId = o.id
      LEFT JOIN (
        SELECT ordenReparacionId, SUM(r.precioCompra) AS total
        FROM ReparacionDeTercero r WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId
      ) ter_c ON ter_c.ordenReparacionId = o.id
      LEFT JOIN (
        SELECT ordenReparacionId, SUM(t.precioUnitario) AS total
        FROM TrabajoRealizado t WHERE t.ordenReparacionId IS NOT NULL GROUP BY t.ordenReparacionId
      ) trab ON trab.ordenReparacionId = o.id
      WHERE o.estado IN ('Terminado', 'SeRetira')
        AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}

      UNION ALL

      SELECT
        (
          COALESCE(rep_v.total, 0) + COALESCE(ter_v.total, 0) + COALESCE(trab.total, 0)
          + COALESCE(v.incremento, 0) - COALESCE(v.descuento, 0)
        ) AS total_cliente,
        (COALESCE(rep_c.total, 0) + COALESCE(ter_c.total, 0)) AS costo_taller
      FROM Venta v
      LEFT JOIN (
        SELECT ventaId, SUM(
          CEIL(r.precioVenta * (1 + vt.porcentajeRecargo / 100.0) / 500.0) * 500
        ) AS total FROM RepuestoUsado r
        JOIN Venta vt ON vt.id = r.ventaId
        WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId
      ) rep_v ON rep_v.ventaId = v.id
      LEFT JOIN (
        SELECT ventaId, SUM(r.precioCompra * r.unidadesConsumidas) AS total
        FROM RepuestoUsado r WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId
      ) rep_c ON rep_c.ventaId = v.id
      LEFT JOIN (
        SELECT ventaId, SUM(
          CEIL(r.precioVenta * (1 + vt.porcentajeRecargo / 100.0) / 500.0) * 500
        ) AS total FROM ReparacionDeTercero r
        JOIN Venta vt ON vt.id = r.ventaId
        WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId
      ) ter_v ON ter_v.ventaId = v.id
      LEFT JOIN (
        SELECT ventaId, SUM(r.precioCompra) AS total
        FROM ReparacionDeTercero r WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId
      ) ter_c ON ter_c.ventaId = v.id
      LEFT JOIN (
        SELECT ventaId, SUM(t.precioUnitario) AS total
        FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId
      ) trab ON trab.ventaId = v.id
      WHERE v.estado IN ('Entregado', 'Cerrado')
        AND v.fecha >= ${from} AND v.fecha < ${to}
    ) sub
  `;
  return {
    facturacion: Number(rows[0]?.facturacion ?? 0),
    costo: Number(rows[0]?.costo ?? 0),
    ganancia: Number(rows[0]?.ganancia ?? 0),
    cantidad: Number(rows[0]?.cantidad ?? 0),
  };
}

async function getDetalle(from: string, to: string): Promise<OrdenRow[]> {
  const rows = await prisma.$queryRaw<OrdenRow[]>`
    SELECT * FROM (
      SELECT
        o.id, 'OdR' AS tipo, o.fechaCreacion AS fecha, c.fullName AS cliente_nombre,
        COALESCE(rep_v.total, 0) AS total_repuestos_venta,
        COALESCE(rep_c.total, 0) AS total_repuestos_costo,
        COALESCE(ter_v.total, 0) AS total_terceros_venta,
        COALESCE(ter_c.total, 0) AS total_terceros_costo,
        COALESCE(trab.total, 0) AS total_trabajos,
        COALESCE(o.incremento, 0) AS incremento,
        COALESCE(o.incrementoInterno, 0) AS incremento_interno,
        COALESCE(o.descuento, 0) AS descuento,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(o.incremento,0)+COALESCE(o.incrementoInterno,0)-COALESCE(o.descuento,0)) AS total_cliente,
        (COALESCE(rep_c.total,0)+COALESCE(ter_c.total,0)) AS costo_taller,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(o.incremento,0)+COALESCE(o.incrementoInterno,0)-COALESCE(o.descuento,0))-(COALESCE(rep_c.total,0)+COALESCE(ter_c.total,0)) AS ganancia
      FROM OrdenReparacion o
      LEFT JOIN Auto a ON a.id = o.autoId
      LEFT JOIN Cliente c ON c.id = a.ownerId
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM RepuestoUsado r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) rep_v ON rep_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(r.precioCompra*r.unidadesConsumidas) AS total FROM RepuestoUsado r WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) rep_c ON rep_c.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM ReparacionDeTercero r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_v ON ter_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(r.precioCompra) AS total FROM ReparacionDeTercero r WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_c ON ter_c.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ordenReparacionId IS NOT NULL GROUP BY t.ordenReparacionId) trab ON trab.ordenReparacionId=o.id
      WHERE o.estado IN ('Terminado','SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}

      UNION ALL

      SELECT
        v.id, 'Venta' AS tipo, v.fecha AS fecha, COALESCE(c.fullName,v.informacionCliente) AS cliente_nombre,
        COALESCE(rep_v.total,0) AS total_repuestos_venta,
        COALESCE(rep_c.total,0) AS total_repuestos_costo,
        COALESCE(ter_v.total,0) AS total_terceros_venta,
        COALESCE(ter_c.total,0) AS total_terceros_costo,
        COALESCE(trab.total,0) AS total_trabajos,
        COALESCE(v.incremento,0) AS incremento,
        0 AS incremento_interno,
        COALESCE(v.descuento,0) AS descuento,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(v.incremento,0)-COALESCE(v.descuento,0)) AS total_cliente,
        (COALESCE(rep_c.total,0)+COALESCE(ter_c.total,0)) AS costo_taller,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(v.incremento,0)-COALESCE(v.descuento,0))-(COALESCE(rep_c.total,0)+COALESCE(ter_c.total,0)) AS ganancia
      FROM Venta v
      LEFT JOIN Cliente c ON c.id=v.clienteId
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM RepuestoUsado r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) rep_v ON rep_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(r.precioCompra*r.unidadesConsumidas) AS total FROM RepuestoUsado r WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) rep_c ON rep_c.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM ReparacionDeTercero r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_v ON ter_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(r.precioCompra) AS total FROM ReparacionDeTercero r WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_c ON ter_c.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId) trab ON trab.ventaId=v.id
      WHERE v.estado IN ('Entregado','Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to}
    ) combined
    ORDER BY fecha DESC
  `;
  return rows.map((r) => ({
    ...r,
    total_repuestos_venta: Number(r.total_repuestos_venta),
    total_repuestos_costo: Number(r.total_repuestos_costo),
    total_terceros_venta: Number(r.total_terceros_venta),
    total_terceros_costo: Number(r.total_terceros_costo),
    total_trabajos: Number(r.total_trabajos),
    incremento: Number(r.incremento),
    incremento_interno: Number(r.incremento_interno),
    descuento: Number(r.descuento),
    total_cliente: Number(r.total_cliente),
    costo_taller: Number(r.costo_taller),
    ganancia: Number(r.ganancia),
  }));
}

const MESES_LABEL = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

async function getEvolucion(toDateStr: string): Promise<EvolucionRow[]> {
  const toDate = new Date(toDateStr);
  const endMonth = toDate.getMonth() + 1;
  const endYear = toDate.getFullYear();

  const results: EvolucionRow[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) { m += 12; y--; }
    const fi = `${y}-${String(m).padStart(2, "0")}-01`;
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const ff = `${ny}-${String(nm).padStart(2, "0")}-01`;
    const kpi = await getKpis(fi, ff);
    results.push({
      label: `${MESES_LABEL[m]} ${y}`,
      facturacion: kpi.facturacion,
      costo: kpi.costo,
      ganancia: kpi.ganancia,
    });
  }
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const defaults = getDefaultRange();
    const from = fromParam || defaults.from;
    // For "to", add 1 day so the end date is inclusive
    const to = toParam ? addDays(toParam, 1) : defaults.to;

    const prev = getPreviousRange(from, to);

    const [kpis, kpisPrev, detalle, evolucion] = await Promise.all([
      getKpis(from, to),
      getKpis(prev.from, prev.to),
      getDetalle(from, to),
      getEvolucion(to),
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
