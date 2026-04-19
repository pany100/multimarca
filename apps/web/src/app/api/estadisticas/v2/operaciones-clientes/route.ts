import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

interface ClienteRow {
  cliente_nombre: string;
  total: number;
}

interface MarcaRow {
  marca: string;
  cantidad: number;
}

interface ModeloRow {
  modelo: string;
  cantidad: number;
}

// Normalize brand names (CITROEN/CITRÖEN → CITROEN, etc.)
function normalizeMarca(marca: string): string {
  return marca
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function getKpis(from: string, to: string) {
  const [ordenes, ventas, clientes] = await Promise.all([
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) AS count FROM OrdenReparacion
      WHERE estado IN ('Terminado', 'SeRetira') AND fechaCreacion >= ${from} AND fechaCreacion < ${to}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) AS count FROM Venta
      WHERE estado IN ('Entregado', 'Cerrado') AND fecha >= ${from} AND fecha < ${to}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT sub.clienteId) AS count FROM (
        SELECT a.ownerId AS clienteId FROM OrdenReparacion o
        JOIN Auto a ON a.id = o.autoId
        WHERE o.estado IN ('Terminado', 'SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
        UNION
        SELECT v.clienteId FROM Venta v
        WHERE v.estado IN ('Entregado', 'Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to} AND v.clienteId IS NOT NULL
      ) sub
    `,
  ]);

  const ordenesCount = Number(ordenes[0]?.count ?? 0);
  const ventasCount = Number(ventas[0]?.count ?? 0);
  const clientesCount = Number(clientes[0]?.count ?? 0);

  // Get total facturacion for ticket promedio
  const facturacion = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(sub.total_cliente), 0) AS total FROM (
      SELECT (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(o.incremento,0)+COALESCE(o.incrementoInterno,0)-COALESCE(o.descuento,0)) AS total_cliente
      FROM OrdenReparacion o
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM RepuestoUsado r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) rep_v ON rep_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM ReparacionDeTercero r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_v ON ter_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ordenReparacionId IS NOT NULL GROUP BY t.ordenReparacionId) trab ON trab.ordenReparacionId=o.id
      WHERE o.estado IN ('Terminado','SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
      UNION ALL
      SELECT (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(v.incremento,0)-COALESCE(v.descuento,0)) AS total_cliente
      FROM Venta v
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM RepuestoUsado r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) rep_v ON rep_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM ReparacionDeTercero r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_v ON ter_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId) trab ON trab.ventaId=v.id
      WHERE v.estado IN ('Entregado','Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to}
    ) sub
  `;

  const totalFacturacion = Number(facturacion[0]?.total ?? 0);
  const totalOps = ordenesCount + ventasCount;

  return {
    ordenes: ordenesCount,
    ventas: ventasCount,
    clientes: clientesCount,
    ticketPromedio: totalOps > 0 ? totalFacturacion / totalOps : 0,
  };
}

async function getTopClientes(from: string, to: string): Promise<ClienteRow[]> {
  const rows = await prisma.$queryRaw<ClienteRow[]>`
    SELECT sub.cliente_nombre, SUM(sub.total_cliente) AS total FROM (
      SELECT c.fullName AS cliente_nombre,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(o.incremento,0)+COALESCE(o.incrementoInterno,0)-COALESCE(o.descuento,0)) AS total_cliente
      FROM OrdenReparacion o
      JOIN Auto a ON a.id = o.autoId
      JOIN Cliente c ON c.id = a.ownerId
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM RepuestoUsado r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) rep_v ON rep_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(CASE WHEN oRep.porcentajeRecargo=0 THEN r.precioVenta ELSE CEIL(r.precioVenta*(1+oRep.porcentajeRecargo/100.0)/500.0)*500 END) AS total FROM ReparacionDeTercero r JOIN OrdenReparacion oRep ON oRep.id=r.ordenReparacionId WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_v ON ter_v.ordenReparacionId=o.id
      LEFT JOIN (SELECT ordenReparacionId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ordenReparacionId IS NOT NULL GROUP BY t.ordenReparacionId) trab ON trab.ordenReparacionId=o.id
      WHERE o.estado IN ('Terminado','SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
      UNION ALL
      SELECT COALESCE(c.fullName, v.informacionCliente) AS cliente_nombre,
        (COALESCE(rep_v.total,0)+COALESCE(ter_v.total,0)+COALESCE(trab.total,0)+COALESCE(v.incremento,0)-COALESCE(v.descuento,0)) AS total_cliente
      FROM Venta v
      LEFT JOIN Cliente c ON c.id = v.clienteId
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM RepuestoUsado r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) rep_v ON rep_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(CEIL(r.precioVenta*(1+vt.porcentajeRecargo/100.0)/500.0)*500) AS total FROM ReparacionDeTercero r JOIN Venta vt ON vt.id=r.ventaId WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_v ON ter_v.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId) trab ON trab.ventaId=v.id
      WHERE v.estado IN ('Entregado','Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to}
    ) sub
    WHERE sub.cliente_nombre IS NOT NULL
    GROUP BY sub.cliente_nombre
    ORDER BY total DESC
    LIMIT 10
  `;
  return rows.map(r => ({ cliente_nombre: r.cliente_nombre, total: Number(r.total) }));
}

async function getMarcas(from: string, to: string): Promise<MarcaRow[]> {
  const rows = await prisma.$queryRaw<{ marca: string; cantidad: number }[]>`
    SELECT a.brand AS marca, COUNT(*) AS cantidad
    FROM OrdenReparacion o
    JOIN Auto a ON a.id = o.autoId
    WHERE o.estado IN ('Terminado', 'SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
    AND a.brand IS NOT NULL AND a.brand != ''
    GROUP BY a.brand
    ORDER BY cantidad DESC
  `;

  // Normalize and merge brands
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = normalizeMarca(r.marca);
    map.set(key, (map.get(key) ?? 0) + Number(r.cantidad));
  }

  return Array.from(map.entries())
    .map(([marca, cantidad]) => ({ marca, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

async function getModelos(from: string, to: string, marca: string): Promise<ModeloRow[]> {
  const normalizedTarget = normalizeMarca(marca);

  const allRows = await prisma.$queryRaw<{ marca: string; modelo: string; cantidad: number }[]>`
    SELECT a.brand AS marca, a.model AS modelo, COUNT(*) AS cantidad
    FROM OrdenReparacion o
    JOIN Auto a ON a.id = o.autoId
    WHERE o.estado IN ('Terminado', 'SeRetira') AND o.fechaCreacion >= ${from} AND o.fechaCreacion < ${to}
    AND a.brand IS NOT NULL AND a.model IS NOT NULL AND a.model != ''
    GROUP BY a.brand, a.model
    ORDER BY cantidad DESC
  `;

  const modelMap = new Map<string, number>();
  for (const r of allRows) {
    if (normalizeMarca(r.marca) === normalizedTarget) {
      const modelKey = r.modelo.toUpperCase().trim();
      modelMap.set(modelKey, (modelMap.get(modelKey) ?? 0) + Number(r.cantidad));
    }
  }

  return Array.from(modelMap.entries())
    .map(([modelo, cantidad]) => ({ modelo, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const { from, to } = getDefaultRange();
    const { searchParams } = new URL(request.url);
    const marcaParam = searchParams.get("marca");

    const [kpis, topClientes, marcas] = await Promise.all([
      getKpis(from, to),
      getTopClientes(from, to),
      getMarcas(from, to),
    ]);

    // Get modelos for the selected or top brand
    const marcaForModelos = marcaParam || (marcas.length > 0 ? marcas[0].marca : "");
    const modelos = marcaForModelos ? await getModelos(from, to, marcaForModelos) : [];

    return NextResponse.json({
      kpis,
      topClientes,
      marcas,
      modelos,
      marcaSeleccionada: marcaForModelos,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
