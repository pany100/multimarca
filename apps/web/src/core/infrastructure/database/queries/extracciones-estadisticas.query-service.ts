/**
 * Estadísticas de extracciones (retiros de caja).
 *
 * Read model especializado para la sección "Extracciones" de Resumen General.
 * Reutiliza los helpers de rango de fechas de financiero.query-service.ts.
 *
 * Conversión de moneda: los montos en dólares se expresan en ARS usando
 * `cotizacionDolar` (fallback 1), igual que getGastosOperativos.
 *
 *  `from` inclusive, `to` exclusivo (formato YYYY-MM-DD).
 */

import { prisma } from "@/core/infrastructure/database/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KpiExtracciones {
  total: number;
  cantidad: number;
  promedio: number;
  gastosBancarios: number;
  gastosArba: number;
}

export interface MesExtracciones {
  label: string;
  total: number;
  cantidad: number;
  /** total extraído por cada usuario en el mes (ARS) */
  porUsuario: Record<string, number>;
}

export interface EvolucionExtracciones {
  meses: MesExtracciones[];
  /** unión de usuarios presentes en el período, ordenados por total descendente */
  usuarios: string[];
}

export interface ExtraccionPorUsuario {
  usuario: string;
  total: number;
  cantidad: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MESES_LABEL = [
  "",
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

/**
 * Totales agregados de extracciones en el rango: monto (ARS), cantidad,
 * promedio por extracción y gastos asociados (bancarios + ARBA).
 */
export async function getKpisExtracciones(from: string, to: string): Promise<KpiExtracciones> {
  const rows = await prisma.$queryRaw<
    { total: number; cantidad: number; gastos_bancarios: number; gastos_arba: number }[]
  >`
    SELECT
      COALESCE(SUM(CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END), 0) AS total,
      COUNT(*) AS cantidad,
      COALESCE(SUM(e.gastosBancarios), 0) AS gastos_bancarios,
      COALESCE(SUM(e.gastosArba), 0) AS gastos_arba
    FROM Extraccion e
    WHERE e.fecha >= ${from} AND e.fecha < ${to}
  `;
  const total = toNum(rows[0]?.total);
  const cantidad = toNum(rows[0]?.cantidad);
  return {
    total,
    cantidad,
    promedio: cantidad > 0 ? total / cantidad : 0,
    gastosBancarios: toNum(rows[0]?.gastos_bancarios),
    gastosArba: toNum(rows[0]?.gastos_arba),
  };
}

// ─── Desglose por usuario ─────────────────────────────────────────────────────

/**
 * Extracciones agrupadas por usuario que las realizó (ARS).
 */
export async function getExtraccionesPorUsuario(from: string, to: string): Promise<ExtraccionPorUsuario[]> {
  const rows = await prisma.$queryRaw<ExtraccionPorUsuario[]>`
    SELECT
      u.fullName AS usuario,
      COALESCE(SUM(CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END), 0) AS total,
      COUNT(*) AS cantidad
    FROM Extraccion e
    INNER JOIN Usuario u ON u.id = e.usuarioId
    WHERE e.fecha >= ${from} AND e.fecha < ${to}
    GROUP BY u.id, u.fullName
    ORDER BY total DESC
  `;
  return rows.map((r) => ({
    usuario: r.usuario,
    total: toNum(r.total),
    cantidad: toNum(r.cantidad),
  }));
}

// ─── Evolución temporal ──────────────────────────────────────────────────────

/**
 * Evolución mensual de extracciones de los últimos N meses hasta `toDate`,
 * con desglose por usuario en cada mes (para barras apiladas).
 */
export async function getEvolucionExtracciones(toDate: string, meses: number = 6): Promise<EvolucionExtracciones> {
  const d = new Date(toDate);
  const endMonth = d.getMonth() + 1;
  const endYear = d.getFullYear();

  const mesesResult: MesExtracciones[] = [];
  const totalesPorUsuario = new Map<string, number>();

  for (let i = meses - 1; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) { m += 12; y--; }
    const fi = `${y}-${String(m).padStart(2, "0")}-01`;
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const ff = `${ny}-${String(nm).padStart(2, "0")}-01`;

    const rows = await prisma.$queryRaw<{ usuario: string; total: number; cantidad: number }[]>`
      SELECT
        u.fullName AS usuario,
        COALESCE(SUM(CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END), 0) AS total,
        COUNT(*) AS cantidad
      FROM Extraccion e
      INNER JOIN Usuario u ON u.id = e.usuarioId
      WHERE e.fecha >= ${fi} AND e.fecha < ${ff}
      GROUP BY u.id, u.fullName
    `;

    const porUsuario: Record<string, number> = {};
    let total = 0;
    let cantidad = 0;
    for (const r of rows) {
      const t = toNum(r.total);
      porUsuario[r.usuario] = t;
      total += t;
      cantidad += toNum(r.cantidad);
      totalesPorUsuario.set(r.usuario, (totalesPorUsuario.get(r.usuario) ?? 0) + t);
    }

    mesesResult.push({
      label: `${MESES_LABEL[m]} ${y}`,
      total,
      cantidad,
      porUsuario,
    });
  }

  const usuarios = Array.from(totalesPorUsuario.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([usuario]) => usuario);

  return { meses: mesesResult, usuarios };
}
