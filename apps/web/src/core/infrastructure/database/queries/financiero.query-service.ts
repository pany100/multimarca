/**
 * Módulo centralizado de cálculos financieros.
 *
 * Fuente de verdad para:
 *  - Facturación, costo y ganancia de OdR/Ventas
 *  - Flujo de caja (cobrado vs gastos operativos)
 *  - Composición de facturación (repuestos, mano de obra, terceros)
 *
 * Fórmulas:
 *  Facturación = repuestosVenta + tercerosVenta + trabajos + incremento + incrementoInterno - descuento
 *  Costo       = repuestosCompra * unidades + tercerosCompra
 *  Ganancia    = Facturación - Costo
 *
 *  Recargo repuestos/terceros:
 *    - porcentajeRecargo = 0 → precioVenta tal cual
 *    - porcentajeRecargo > 0 → CEIL(precioVenta * (1 + recargo/100) / 500) * 500
 *
 *  OdR estados válidos: ('Terminado', 'SeRetira')
 *  Venta estados válidos: ('Entregado', 'Cerrado')
 */

import { prisma } from "@/core/infrastructure/database/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KpiFinanciero {
  facturacion: number;
  costo: number;
  ganancia: number;
  cantidad: number;
}

export interface DetalleOrden {
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

export interface ComposicionFacturacion {
  repuestos: number;
  manoDeObra: number;
  terceros: number;
}

export interface GananciaIvaPeriodo {
  taller: number;
  terceros: number;
  total: number;
}

export interface FlujoCaja {
  cobrado: number;
  gastos: number;
  balance: number;
}

export interface CategoriaGasto {
  nombre: string;
  total: number;
}

export interface TipoOperacion {
  label: string;
  total: number;
  es_ingreso: boolean;
}

export interface EvolucionMensual {
  label: string;
  facturacion: number;
  costo: number;
  ganancia: number;
}

export interface EvolucionCaja {
  label: string;
  cobrado: number;
  gastos: number;
  balance: number;
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

// ─── Rentabilidad (facturación / costo / ganancia) ───────────────────────────

/**
 * KPIs de facturación, costo y ganancia para OdR + Ventas en un rango.
 * `from` inclusive, `to` exclusive (formato YYYY-MM-DD).
 */
export async function getKpisRentabilidad(from: string, to: string): Promise<KpiFinanciero> {
  const rows = await prisma.$queryRaw<KpiFinanciero[]>`
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
        SELECT ordenReparacionId, SUM(r.precioCompra * r.cantidad) AS total
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
        SELECT ventaId, SUM(r.precioCompra * r.cantidad) AS total
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
    facturacion: toNum(rows[0]?.facturacion),
    costo: toNum(rows[0]?.costo),
    ganancia: toNum(rows[0]?.ganancia),
    cantidad: toNum(rows[0]?.cantidad),
  };
}

/**
 * Detalle por OdR/Venta individual con desglose de componentes.
 */
export async function getDetalleOrdenes(from: string, to: string): Promise<DetalleOrden[]> {
  const rows = await prisma.$queryRaw<DetalleOrden[]>`
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
      LEFT JOIN (SELECT ordenReparacionId, SUM(r.precioCompra * r.cantidad) AS total FROM ReparacionDeTercero r WHERE r.ordenReparacionId IS NOT NULL GROUP BY r.ordenReparacionId) ter_c ON ter_c.ordenReparacionId=o.id
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
      LEFT JOIN (SELECT ventaId, SUM(r.precioCompra * r.cantidad) AS total FROM ReparacionDeTercero r WHERE r.ventaId IS NOT NULL GROUP BY r.ventaId) ter_c ON ter_c.ventaId=v.id
      LEFT JOIN (SELECT ventaId, SUM(t.precioUnitario) AS total FROM TrabajoRealizado t WHERE t.ventaId IS NOT NULL GROUP BY t.ventaId) trab ON trab.ventaId=v.id
      WHERE v.estado IN ('Entregado','Cerrado') AND v.fecha >= ${from} AND v.fecha < ${to}
    ) combined
    ORDER BY fecha DESC
  `;
  return rows.map((r) => ({
    ...r,
    total_repuestos_venta: toNum(r.total_repuestos_venta),
    total_repuestos_costo: toNum(r.total_repuestos_costo),
    total_terceros_venta: toNum(r.total_terceros_venta),
    total_terceros_costo: toNum(r.total_terceros_costo),
    total_trabajos: toNum(r.total_trabajos),
    incremento: toNum(r.incremento),
    incremento_interno: toNum(r.incremento_interno),
    descuento: toNum(r.descuento),
    total_cliente: toNum(r.total_cliente),
    costo_taller: toNum(r.costo_taller),
    ganancia: toNum(r.ganancia),
  }));
}

/**
 * Composición de facturación: repuestos, mano de obra, terceros.
 */
export async function getComposicionFacturacion(from: string, to: string): Promise<ComposicionFacturacion> {
  const rows = await prisma.$queryRaw<{ repuestos: number; mano_de_obra: number; terceros: number }[]>`
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
  return {
    repuestos: toNum(rows[0]?.repuestos),
    manoDeObra: toNum(rows[0]?.mano_de_obra),
    terceros: toNum(rows[0]?.terceros),
  };
}

// ─── Compras de repuestos ────────────────────────────────────────────────────

/**
 * Total facturado por proveedores en órdenes de compra (cash-out a proveedores)
 * dentro del período [from, to). Independiente de la facturación al cliente:
 * refleja lo comprado al proveedor en el período, no lo consumido.
 */
export async function getComprasRepuestosPeriodo(from: string, to: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(precioTotal), 0) AS total
    FROM OrdenDeCompra
    WHERE fecha >= ${from} AND fecha < ${to}
  `;
  return toNum(rows[0]?.total);
}

// ─── Ganancia por diferencia de IVA ──────────────────────────────────────────

/**
 * Ganancia por diferencia de IVA en repuestos consumidos en el período.
 * Misma fórmula que estadisticas-repuestos.service.ts, pero agregada por período
 * y separando taller (RepuestoUsado) de terceros (ReparacionDeTercero).
 *
 * Fórmula por item:
 *   (precioCompra * (1 + markup/100) * (iva/100) - precioCompra * (buyIva/100))
 *   * unidades_consumidas_o_cantidad
 *
 * Los estados válidos coinciden con getKpisRentabilidad (Terminado/SeRetira para
 * OdR, Entregado/Cerrado para Venta) para que el período se alinee con la
 * facturación.
 */
export async function getGananciaIvaPeriodo(from: string, to: string): Promise<GananciaIvaPeriodo> {
  const tallerRows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(
      (
        r.precioCompra * (1 + COALESCE(r.markup, 0) / 100.0) * (COALESCE(r.iva, 0) / 100.0)
        - r.precioCompra * (COALESCE(r.buyIva, 0) / 100.0)
      ) * r.unidadesConsumidas
    ), 0) AS total
    FROM RepuestoUsado r
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
  `;

  const tercerosRows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(
      (
        rt.precioCompra * (1 + COALESCE(rt.markup, 0) / 100.0) * (COALESCE(rt.iva, 0) / 100.0)
        - rt.precioCompra * (COALESCE(rt.buyIva, 0) / 100.0)
      ) * rt.cantidad
    ), 0) AS total
    FROM ReparacionDeTercero rt
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
  `;

  const taller = toNum(tallerRows[0]?.total);
  const terceros = toNum(tercerosRows[0]?.total);
  return { taller, terceros, total: taller + terceros };
}

// ─── Flujo de caja ───────────────────────────────────────────────────────────

/**
 * Total cobrado: pagos recibidos por reparaciones + ventas + ingresos manuales.
 */
export async function getCobrado(from: string, to: string): Promise<number> {
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
  return toNum(rows[0]?.total);
}

/**
 * Total gastos operativos: gastos + extracciones.
 */
export async function getGastosOperativos(from: string, to: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: number }[]>`
    SELECT COALESCE(SUM(sub.monto), 0) AS total FROM (
      SELECT CASE WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(g.cotizacionDolar, 1) ELSE g.precio END AS monto
      FROM Gasto g WHERE g.fecha >= ${from} AND g.fecha < ${to}
      UNION ALL
      SELECT CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END AS monto
      FROM Extraccion e WHERE e.fecha >= ${from} AND e.fecha < ${to}
    ) sub
  `;
  return toNum(rows[0]?.total);
}

/**
 * Flujo de caja completo: cobrado - gastos.
 */
export async function getFlujoCaja(from: string, to: string): Promise<FlujoCaja> {
  const [cobrado, gastos] = await Promise.all([
    getCobrado(from, to),
    getGastosOperativos(from, to),
  ]);
  return { cobrado, gastos, balance: cobrado - gastos };
}

/**
 * Gastos desglosados por categoría.
 */
export async function getGastosPorCategoria(from: string, to: string): Promise<CategoriaGasto[]> {
  const rows = await prisma.$queryRaw<CategoriaGasto[]>`
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
  return rows.map((r) => ({ nombre: r.nombre, total: toNum(r.total) }));
}

/**
 * Movimientos por tipo de operación (efectivo, transferencia, etc).
 */
export async function getTiposOperacion(from: string, to: string): Promise<TipoOperacion[]> {
  const rows = await prisma.$queryRaw<TipoOperacion[]>`
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
  return rows.map((r) => ({ label: r.label, total: toNum(r.total), es_ingreso: Boolean(r.es_ingreso) }));
}

// ─── Evolución temporal ──────────────────────────────────────────────────────

/**
 * Evolución mensual de rentabilidad (últimos N meses hasta `toDate`).
 */
export async function getEvolucionRentabilidad(toDate: string, meses: number = 6): Promise<EvolucionMensual[]> {
  const d = new Date(toDate);
  const endMonth = d.getMonth() + 1;
  const endYear = d.getFullYear();

  const results: EvolucionMensual[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) { m += 12; y--; }
    const fi = `${y}-${String(m).padStart(2, "0")}-01`;
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const ff = `${ny}-${String(nm).padStart(2, "0")}-01`;
    const kpi = await getKpisRentabilidad(fi, ff);
    results.push({
      label: `${MESES_LABEL[m]} ${y}`,
      facturacion: kpi.facturacion,
      costo: kpi.costo,
      ganancia: kpi.ganancia,
    });
  }
  return results;
}

/**
 * Evolución mensual de flujo de caja (últimos N meses).
 */
export async function getEvolucionCaja(toDate: string, meses: number = 6): Promise<EvolucionCaja[]> {
  const d = new Date(toDate);
  const endMonth = d.getMonth() + 1;
  const endYear = d.getFullYear();

  const results: EvolucionCaja[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) { m += 12; y--; }
    const fi = `${y}-${String(m).padStart(2, "0")}-01`;
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const ff = `${ny}-${String(nm).padStart(2, "0")}-01`;
    const flujo = await getFlujoCaja(fi, ff);
    results.push({
      label: `${MESES_LABEL[m]} ${y}`,
      cobrado: flujo.cobrado,
      gastos: flujo.gastos,
      balance: flujo.balance,
    });
  }
  return results;
}

// ─── Rango de fechas por defecto ─────────────────────────────────────────────

export function getDefaultDateRange() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  const to = `${ny}-${String(nm).padStart(2, "0")}-01`;
  return { from, to, month: m, year: y };
}

export function getPreviousRange(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  const diff = t.getTime() - f.getTime();
  const pf = new Date(f.getTime() - diff);
  return { from: pf.toISOString().split("T")[0], to: from };
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
