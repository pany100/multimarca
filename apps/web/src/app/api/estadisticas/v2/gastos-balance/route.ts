import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MESES_LABEL = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getDefaultRange() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  const to = `${ny}-${String(nm).padStart(2, "0")}-01`;
  return { from, to, month: m, year: y };
}

function getPrevRange(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  const diff = t.getTime() - f.getTime();
  const pf = new Date(f.getTime() - diff);
  return { from: pf.toISOString().split("T")[0], to: from };
}

interface CatRow { nombre: string; total: number; }
interface TipoOpRow { label: string; total: number; es_ingreso: boolean; }
interface EvoRow { label: string; cobrado: number; gastos: number; balance: number; }

async function getCobrado(from: string, to: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(sub.monto), 0) AS total FROM (
      SELECT CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoPorReparacion i WHERE i.fecha >= ${from} AND i.fecha < ${to}
      UNION ALL
      SELECT CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoPorVenta i WHERE i.fecha >= ${from} AND i.fecha < ${to}
      UNION ALL
      SELECT CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoManualDeDinero i WHERE i.fecha >= ${from} AND i.fecha < ${to}
    ) sub
  `;
  return Number(rows[0]?.total ?? 0);
}

async function getGastosTotal(from: string, to: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(sub.monto), 0) AS total FROM (
      SELECT CASE WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(g.cotizacionDolar, 1) ELSE g.precio END AS monto
      FROM Gasto g WHERE g.fecha >= ${from} AND g.fecha < ${to}
      UNION ALL
      SELECT CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END AS monto
      FROM Extraccion e WHERE e.fecha >= ${from} AND e.fecha < ${to}
    ) sub
  `;
  return Number(rows[0]?.total ?? 0);
}

async function getGastosPorCategoria(from: string, to: string): Promise<CatRow[]> {
  const rows = await prisma.$queryRaw<CatRow[]>`
    SELECT sub.nombre, SUM(sub.monto) AS total FROM (
      SELECT cg.nombre,
        CASE WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(g.cotizacionDolar, 1) ELSE g.precio END AS monto
      FROM Gasto g
      JOIN CategoriaGasto cg ON cg.id = g.categoriaId
      WHERE g.fecha >= ${from} AND g.fecha < ${to}
      UNION ALL
      SELECT 'Extracciones' AS nombre,
        CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END AS monto
      FROM Extraccion e WHERE e.fecha >= ${from} AND e.fecha < ${to}
    ) sub
    GROUP BY sub.nombre
    ORDER BY total DESC
  `;
  return rows.map(r => ({ nombre: r.nombre, total: Number(r.total) }));
}

async function getTiposOperacion(from: string, to: string): Promise<TipoOpRow[]> {
  const rows = await prisma.$queryRaw<TipoOpRow[]>`
    SELECT t.label, SUM(sub.monto) AS total, t.esIngreso AS es_ingreso FROM (
      SELECT i.tipoOperacionId AS tipoId,
        CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoPorReparacion i WHERE i.fecha >= ${from} AND i.fecha < ${to}
      UNION ALL
      SELECT i.tipoOperacionId AS tipoId,
        CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoPorVenta i WHERE i.fecha >= ${from} AND i.fecha < ${to}
      UNION ALL
      SELECT i.tipoOperacionId AS tipoId,
        CASE WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar, 1) ELSE i.monto END AS monto
      FROM IngresoManualDeDinero i WHERE i.fecha >= ${from} AND i.fecha < ${to}
      UNION ALL
      SELECT g.tipoOperacionId AS tipoId,
        CASE WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(g.cotizacionDolar, 1) ELSE g.precio END AS monto
      FROM Gasto g WHERE g.fecha >= ${from} AND g.fecha < ${to}
      UNION ALL
      SELECT e.tipoOperacionId AS tipoId,
        CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END AS monto
      FROM Extraccion e WHERE e.fecha >= ${from} AND e.fecha < ${to}
    ) sub
    JOIN TipoDeOperacion t ON t.id = sub.tipoId
    GROUP BY t.id, t.label, t.esIngreso
    ORDER BY total DESC
  `;
  return rows.map(r => ({ label: r.label, total: Number(r.total), es_ingreso: Boolean(r.es_ingreso) }));
}

async function getEvolucion(endMonth: number, endYear: number): Promise<EvoRow[]> {
  const results: EvoRow[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) { m += 12; y--; }
    const fi = `${y}-${String(m).padStart(2, "0")}-01`;
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const ff = `${ny}-${String(nm).padStart(2, "0")}-01`;
    const [cobrado, gastos] = await Promise.all([getCobrado(fi, ff), getGastosTotal(fi, ff)]);
    results.push({ label: `${MESES_LABEL[m]} ${y}`, cobrado, gastos, balance: cobrado - gastos });
  }
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const defaults = getDefaultRange();
    const from = defaults.from;
    const to = defaults.to;
    const prev = getPrevRange(from, to);

    const [cobrado, cobradoPrev, gastos, gastosPrev, categorias, tiposOp, evolucion] = await Promise.all([
      getCobrado(from, to),
      getCobrado(prev.from, prev.to),
      getGastosTotal(from, to),
      getGastosTotal(prev.from, prev.to),
      getGastosPorCategoria(from, to),
      getTiposOperacion(from, to),
      getEvolucion(defaults.month, defaults.year),
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
