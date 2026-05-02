/**
 * Ranking de repuestos vendidos en un período.
 *
 * Reglas:
 * - "Vendido" = línea cuya OdR está en estado Terminado/SeRetira o cuya Venta está en
 *   estado Entregado/Cerrado, dentro del rango [from, to).
 * - precioVenta es total de línea (precio * cantidad, con IVA), precioCompra es por unidad.
 *   Esto se alinea con financiero.query-service.ts (fuente de verdad financiera).
 * - Ganancia se desglosa en margen e IVA, replicando la fórmula del detalle de Stock
 *   (apps/web/src/app/dashboard/stock/[id]/page.tsx, panel "Ganancia IVA"):
 *     gananciaPorMargen_unit = precioCompra * (markup/100)
 *     gananciaPorIva_unit    = precioCompra * (1 + markup/100) * (iva/100)
 *                              - precioCompra * (buyIva/100)
 *     gananciaTotal          = (gananciaPorMargen_unit + gananciaPorIva_unit) * cantidad
 */

import { prisma } from "@/core/infrastructure/database/prisma";

export interface RankingRow {
  nombre: string;
  marca?: string | null;
  proveedor?: string | null;
  unidades: number;
  facturacion: number;
  costo: number;
  gananciaPorMargen: number;
  gananciaPorIva: number;
  gananciaTotal: number;
}

export interface RankingKpis {
  unidadesVendidas: number;
  facturacionTotal: number;
  costoTotal: number;
  gananciaPorMargen: number;
  gananciaPorIva: number;
  gananciaTotal: number;
  cantidadProductosDistintos: number;
}

export interface RankingRepuestosResult {
  kpis: RankingKpis;
  topPorUnidades: RankingRow[];
  topPorFacturacion: RankingRow[];
  topPorGanancia: RankingRow[];
}

const TOP_N = 20;

interface TallerRow {
  stockId: number;
  nombre: string;
  marca: string | null;
  unidades: string | number;
  facturacion: string | number;
  costo: string | number;
  ganancia_margen: string | number;
  ganancia_iva: string | number;
}

interface TercerosRow {
  nombre: string;
  proveedor: string | null;
  unidades: string | number;
  facturacion: string | number;
  costo: string | number;
  ganancia_margen: string | number;
  ganancia_iva: string | number;
}

const num = (v: string | number | bigint | null | undefined): number => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  return Number(v);
};

function buildResult<T extends RankingRow>(rows: T[]): RankingRepuestosResult {
  const kpis: RankingKpis = {
    unidadesVendidas: 0,
    facturacionTotal: 0,
    costoTotal: 0,
    gananciaPorMargen: 0,
    gananciaPorIva: 0,
    gananciaTotal: 0,
    cantidadProductosDistintos: rows.length,
  };
  for (const r of rows) {
    kpis.unidadesVendidas += r.unidades;
    kpis.facturacionTotal += r.facturacion;
    kpis.costoTotal += r.costo;
    kpis.gananciaPorMargen += r.gananciaPorMargen;
    kpis.gananciaPorIva += r.gananciaPorIva;
    kpis.gananciaTotal += r.gananciaTotal;
  }

  const topPorUnidades = [...rows]
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, TOP_N);
  const topPorFacturacion = [...rows]
    .sort((a, b) => b.facturacion - a.facturacion)
    .slice(0, TOP_N);
  const topPorGanancia = [...rows]
    .sort((a, b) => b.gananciaTotal - a.gananciaTotal)
    .slice(0, TOP_N);

  return { kpis, topPorUnidades, topPorFacturacion, topPorGanancia };
}

export async function getRankingRepuestosTaller(
  from: string,
  to: string
): Promise<RankingRepuestosResult> {
  const rows = await prisma.$queryRaw<TallerRow[]>`
    SELECT
      s.id AS stockId,
      s.name AS nombre,
      s.brand AS marca,
      SUM(r.unidadesConsumidas) AS unidades,
      SUM(r.precioVenta) AS facturacion,
      SUM(r.precioCompra * r.unidadesConsumidas) AS costo,
      SUM(
        r.precioCompra * (COALESCE(r.markup, 0) / 100.0) * r.unidadesConsumidas
      ) AS ganancia_margen,
      SUM(
        (
          r.precioCompra * (1 + COALESCE(r.markup, 0) / 100.0) * (COALESCE(r.iva, 0) / 100.0)
          - r.precioCompra * (COALESCE(r.buyIva, 0) / 100.0)
        ) * r.unidadesConsumidas
      ) AS ganancia_iva
    FROM RepuestoUsado r
    JOIN Stock s ON s.id = r.stockId
    LEFT JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
    LEFT JOIN Venta v ON v.id = r.ventaId
    WHERE (
      (
        r.ordenReparacionId IS NOT NULL
        AND o.estado IN ('Terminado', 'SeRetira')
        AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
      )
      OR (
        r.ventaId IS NOT NULL
        AND v.estado IN ('Entregado', 'Cerrado')
        AND v.fecha >= ${from} AND v.fecha < ${to}
      )
    )
    GROUP BY s.id, s.name, s.brand
  `;

  const mapped: RankingRow[] = rows.map((r) => {
    const margen = num(r.ganancia_margen);
    const iva = num(r.ganancia_iva);
    return {
      nombre: r.nombre,
      marca: r.marca,
      unidades: num(r.unidades),
      facturacion: num(r.facturacion),
      costo: num(r.costo),
      gananciaPorMargen: margen,
      gananciaPorIva: iva,
      gananciaTotal: margen + iva,
    };
  });

  return buildResult(mapped);
}

export async function getRankingRepuestosTerceros(
  from: string,
  to: string
): Promise<RankingRepuestosResult> {
  const rows = await prisma.$queryRaw<TercerosRow[]>`
    SELECT
      LOWER(TRIM(rt.nombre)) AS nombre_key,
      MAX(rt.nombre) AS nombre,
      MAX(p.name) AS proveedor,
      SUM(rt.cantidad) AS unidades,
      SUM(rt.precioVenta) AS facturacion,
      SUM(rt.precioCompra * rt.cantidad) AS costo,
      SUM(
        rt.precioCompra * (COALESCE(rt.markup, 0) / 100.0) * rt.cantidad
      ) AS ganancia_margen,
      SUM(
        (
          rt.precioCompra * (1 + COALESCE(rt.markup, 0) / 100.0) * (COALESCE(rt.iva, 0) / 100.0)
          - rt.precioCompra * (COALESCE(rt.buyIva, 0) / 100.0)
        ) * rt.cantidad
      ) AS ganancia_iva
    FROM ReparacionDeTercero rt
    LEFT JOIN Proveedor p ON p.id = rt.proveedorId
    LEFT JOIN OrdenReparacion o ON o.id = rt.ordenReparacionId
    LEFT JOIN Venta v ON v.id = rt.ventaId
    WHERE (
      (
        rt.ordenReparacionId IS NOT NULL
        AND o.estado IN ('Terminado', 'SeRetira')
        AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
      )
      OR (
        rt.ventaId IS NOT NULL
        AND v.estado IN ('Entregado', 'Cerrado')
        AND v.fecha >= ${from} AND v.fecha < ${to}
      )
    )
    GROUP BY LOWER(TRIM(rt.nombre))
  `;

  const mapped: RankingRow[] = rows.map((r) => {
    const margen = num(r.ganancia_margen);
    const iva = num(r.ganancia_iva);
    return {
      nombre: r.nombre,
      proveedor: r.proveedor,
      unidades: num(r.unidades),
      facturacion: num(r.facturacion),
      costo: num(r.costo),
      gananciaPorMargen: margen,
      gananciaPorIva: iva,
      gananciaTotal: margen + iva,
    };
  });

  return buildResult(mapped);
}
