import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface StockKpis {
  valorCosto: number;
  valorVenta: number;
  gananciaPotencial: number;
  alertasReposicion: number;
}

interface ProductoRentable {
  nombre: string;
  marca: string;
  unidadesVendidas: number;
  ganancia: number;
}

interface ProductoVendido {
  nombre: string;
  marca: string;
  unidadesVendidas: number;
}

interface AlertaReposicion {
  nombre: string;
  marca: string;
  stockActual: number;
  stockMinimo: number;
  proveedor: string | null;
  ultimoPrecioCompra: number;
}

function getDefaultRange() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  const to = `${ny}-${String(nm).padStart(2, "0")}-01`;
  return { from, to };
}

async function getStockKpis(): Promise<StockKpis> {
  const rows = await prisma.$queryRaw<{ valor_costo: number; valor_venta: number; alertas: number }[]>`
    SELECT
      COALESCE(SUM(s.buyPrice * s.units), 0) AS valor_costo,
      COALESCE(SUM(s.buyPrice * (1 + s.markup / 100.0) * s.units), 0) AS valor_venta,
      SUM(CASE WHEN s.units <= s.restockValue AND s.restockValue > 0 THEN 1 ELSE 0 END) AS alertas
    FROM Stock s
    WHERE s.units > 0
  `;
  const costo = Number(rows[0]?.valor_costo ?? 0);
  const venta = Number(rows[0]?.valor_venta ?? 0);
  return {
    valorCosto: costo,
    valorVenta: venta,
    gananciaPotencial: venta - costo,
    alertasReposicion: Number(rows[0]?.alertas ?? 0),
  };
}

async function getProductosRentables(from: string, to: string): Promise<ProductoRentable[]> {
  const rows = await prisma.$queryRaw<ProductoRentable[]>`
    SELECT
      s.name AS nombre,
      COALESCE(s.brand, '') AS marca,
      SUM(r.unidadesConsumidas) AS unidadesVendidas,
      SUM((r.precioVenta - r.precioCompra) * r.unidadesConsumidas) AS ganancia
    FROM RepuestoUsado r
    JOIN Stock s ON s.id = r.stockId
    LEFT JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
    LEFT JOIN Venta v ON v.id = r.ventaId
    WHERE (
      (r.ordenReparacionId IS NOT NULL AND o.estado IN ('Terminado', 'SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to})
      OR
      (r.ventaId IS NOT NULL AND v.estado IN ('Entregado', 'Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to})
    )
    GROUP BY s.id, s.name, s.brand
    ORDER BY ganancia DESC
    LIMIT 10
  `;
  return rows.map(r => ({
    nombre: r.nombre,
    marca: r.marca,
    unidadesVendidas: Number(r.unidadesVendidas),
    ganancia: Number(r.ganancia),
  }));
}

async function getProductosVendidos(from: string, to: string): Promise<ProductoVendido[]> {
  const rows = await prisma.$queryRaw<ProductoVendido[]>`
    SELECT
      s.name AS nombre,
      COALESCE(s.brand, '') AS marca,
      SUM(r.unidadesConsumidas) AS unidadesVendidas
    FROM RepuestoUsado r
    JOIN Stock s ON s.id = r.stockId
    LEFT JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
    LEFT JOIN Venta v ON v.id = r.ventaId
    WHERE (
      (r.ordenReparacionId IS NOT NULL AND o.estado IN ('Terminado', 'SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to})
      OR
      (r.ventaId IS NOT NULL AND v.estado IN ('Entregado', 'Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to})
    )
    GROUP BY s.id, s.name, s.brand
    ORDER BY unidadesVendidas DESC
    LIMIT 10
  `;
  return rows.map(r => ({
    nombre: r.nombre,
    marca: r.marca,
    unidadesVendidas: Number(r.unidadesVendidas),
  }));
}

async function getAlertasReposicion(): Promise<AlertaReposicion[]> {
  const rows = await prisma.$queryRaw<AlertaReposicion[]>`
    SELECT
      s.name AS nombre,
      COALESCE(s.brand, '') AS marca,
      s.units AS stockActual,
      s.restockValue AS stockMinimo,
      p.name AS proveedor,
      s.buyPrice AS ultimoPrecioCompra
    FROM Stock s
    LEFT JOIN Proveedor p ON p.id = s.proveedorId
    WHERE s.restockValue > 0 AND s.units <= s.restockValue
    ORDER BY s.units ASC
    LIMIT 20
  `;
  return rows.map(r => ({
    nombre: r.nombre,
    marca: r.marca,
    stockActual: Number(r.stockActual),
    stockMinimo: Number(r.stockMinimo),
    proveedor: r.proveedor,
    ultimoPrecioCompra: Number(r.ultimoPrecioCompra),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { from, to } = getDefaultRange();

    const [kpis, rentables, vendidos, alertas] = await Promise.all([
      getStockKpis(),
      getProductosRentables(from, to),
      getProductosVendidos(from, to),
      getAlertasReposicion(),
    ]);

    return NextResponse.json({ kpis, rentables, vendidos, alertas });
  } catch (e) {
    return handleApiError(e);
  }
}
