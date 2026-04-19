import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ── helpers ──────────────────────────────────────────────────────────

function dateFilter(field: string, from?: string, to?: string) {
  if (from && to) return Prisma.sql`AND ${Prisma.raw(field)} >= ${from} AND ${Prisma.raw(field)} <= ${to}`;
  if (from) return Prisma.sql`AND ${Prisma.raw(field)} >= ${from}`;
  if (to) return Prisma.sql`AND ${Prisma.raw(field)} <= ${to}`;
  return Prisma.empty;
}

/** Previous period of same length (e.g. 30 days → previous 30 days) */
function previousPeriod(from?: string, to?: string) {
  if (!from || !to) return { prevFrom: undefined, prevTo: undefined };
  const f = new Date(from);
  const t = new Date(to);
  const diffMs = t.getTime() - f.getTime();
  const prevTo = new Date(f.getTime() - 1); // day before current from
  const prevFrom = new Date(prevTo.getTime() - diffMs);
  return {
    prevFrom: prevFrom.toISOString().split("T")[0],
    prevTo: prevTo.toISOString().split("T")[0],
  };
}

// ── KPIs ─────────────────────────────────────────────────────────────

interface KpiRow {
  deuda_total: number;
  cantidad_deudores: number;
  deuda_promedio: number;
  mayor_deuda: number;
}

async function getKpis(from?: string, to?: string): Promise<KpiRow> {
  const rows = await prisma.$queryRaw<KpiRow[]>`
    SELECT
      COALESCE(SUM(d.pendiente), 0)           AS deuda_total,
      COUNT(DISTINCT d.cliente_id)             AS cantidad_deudores,
      COALESCE(AVG(sub.deuda_cliente), 0)      AS deuda_promedio,
      COALESCE(MAX(sub.deuda_cliente), 0)      AS mayor_deuda
    FROM (
      SELECT cliente_id, SUM(pendiente) AS deuda_cliente
      FROM (
        SELECT cliente_id, pendiente FROM v_ventas_totales
        WHERE pendiente > 0 AND estado = 'Entregado'
          ${dateFilter("fecha", from, to)}
        UNION ALL
        SELECT cliente_id, pendiente FROM v_orep_totales
        WHERE pendiente > 0 AND estado = 'Terminado'
          ${dateFilter("fecha", from, to)}
      ) d
      GROUP BY cliente_id
    ) sub
    JOIN (
      SELECT cliente_id, pendiente FROM v_ventas_totales
      WHERE pendiente > 0 AND estado = 'Entregado'
        ${dateFilter("fecha", from, to)}
      UNION ALL
      SELECT cliente_id, pendiente FROM v_orep_totales
      WHERE pendiente > 0 AND estado = 'Terminado'
        ${dateFilter("fecha", from, to)}
    ) d ON d.cliente_id = sub.cliente_id
  `;

  const r = rows[0];
  return {
    deuda_total: Number(r?.deuda_total ?? 0),
    cantidad_deudores: Number(r?.cantidad_deudores ?? 0),
    deuda_promedio: Number(r?.deuda_promedio ?? 0),
    mayor_deuda: Number(r?.mayor_deuda ?? 0),
  };
}

// ── Top deudores ─────────────────────────────────────────────────────

interface DeudorRow {
  cliente_id: number;
  cliente_nombre: string;
  cliente_phone: string | null;
  deuda_total: number;
}

async function getTopDeudores(from?: string, to?: string): Promise<DeudorRow[]> {
  const rows = await prisma.$queryRaw<DeudorRow[]>`
    SELECT
      COALESCE(d.cliente_id, -1)  AS cliente_id,
      MAX(d.cliente_nombre)       AS cliente_nombre,
      MAX(d.cliente_phone)        AS cliente_phone,
      SUM(d.pendiente)            AS deuda_total
    FROM (
      SELECT cliente_id, cliente_nombre, cliente_phone, pendiente
      FROM v_ventas_totales
      WHERE pendiente > 0 AND estado = 'Entregado'
        ${dateFilter("fecha", from, to)}
      UNION ALL
      SELECT cliente_id, cliente_nombre, cliente_phone, pendiente
      FROM v_orep_totales
      WHERE pendiente > 0 AND estado = 'Terminado'
        ${dateFilter("fecha", from, to)}
    ) d
    GROUP BY d.cliente_id
    ORDER BY deuda_total DESC
    LIMIT 15
  `;

  return rows.map((r) => ({
    cliente_id: Number(r.cliente_id),
    cliente_nombre: r.cliente_nombre,
    cliente_phone: r.cliente_phone,
    deuda_total: Number(r.deuda_total),
  }));
}

// ── Composición: OdR vs Ventas ───────────────────────────────────────

interface ComposicionRow {
  origen: string;
  total: number;
}

async function getComposicion(from?: string, to?: string): Promise<ComposicionRow[]> {
  const rows = await prisma.$queryRaw<ComposicionRow[]>`
    SELECT origen, SUM(pendiente) AS total FROM (
      SELECT 'Ventas' AS origen, pendiente FROM v_ventas_totales
      WHERE pendiente > 0 AND estado = 'Entregado'
        ${dateFilter("fecha", from, to)}
      UNION ALL
      SELECT 'Órdenes' AS origen, pendiente FROM v_orep_totales
      WHERE pendiente > 0 AND estado = 'Terminado'
        ${dateFilter("fecha", from, to)}
    ) d
    GROUP BY origen
    ORDER BY total DESC
  `;

  return rows.map((r) => ({ origen: r.origen, total: Number(r.total) }));
}

// ── Antigüedad de deuda ──────────────────────────────────────────────

interface AntiguedadRow {
  rango: string;
  cantidad: number;
  total: number;
}

async function getAntiguedad(from?: string, to?: string): Promise<AntiguedadRow[]> {
  const rows = await prisma.$queryRaw<{ dias: number; pendiente: number }[]>`
    SELECT DATEDIFF(CURDATE(), d.fecha) AS dias, d.pendiente FROM (
      SELECT fecha, pendiente FROM v_ventas_totales
      WHERE pendiente > 0 AND estado = 'Entregado'
        ${dateFilter("fecha", from, to)}
      UNION ALL
      SELECT fecha, pendiente FROM v_orep_totales
      WHERE pendiente > 0 AND estado = 'Terminado'
        ${dateFilter("fecha", from, to)}
    ) d
  `;

  const buckets: Record<string, { cantidad: number; total: number }> = {
    "0-30 días": { cantidad: 0, total: 0 },
    "30-60 días": { cantidad: 0, total: 0 },
    "60-90 días": { cantidad: 0, total: 0 },
    "90+ días": { cantidad: 0, total: 0 },
  };

  for (const r of rows) {
    const dias = Number(r.dias);
    const pendiente = Number(r.pendiente);
    if (dias <= 30) {
      buckets["0-30 días"].cantidad++;
      buckets["0-30 días"].total += pendiente;
    } else if (dias <= 60) {
      buckets["30-60 días"].cantidad++;
      buckets["30-60 días"].total += pendiente;
    } else if (dias <= 90) {
      buckets["60-90 días"].cantidad++;
      buckets["60-90 días"].total += pendiente;
    } else {
      buckets["90+ días"].cantidad++;
      buckets["90+ días"].total += pendiente;
    }
  }

  return Object.entries(buckets).map(([rango, data]) => ({
    rango,
    cantidad: data.cantidad,
    total: data.total,
  }));
}

// ── Handler ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const { prevFrom, prevTo } = previousPeriod(from, to);

    const [kpis, kpisPrev, topDeudores, composicion, antiguedad] =
      await Promise.all([
        getKpis(from, to),
        prevFrom && prevTo ? getKpis(prevFrom, prevTo) : Promise.resolve(null),
        getTopDeudores(from, to),
        getComposicion(from, to),
        getAntiguedad(from, to),
      ]);

    return NextResponse.json({
      kpis,
      kpisPrev,
      topDeudores,
      composicion,
      antiguedad,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
