/**
 * Cálculo de rotación de stock e inactividad de productos.
 *
 * Definiciones:
 *  - "Movimiento" = entrada por compra (OrdenDeCompraItem + OrdenDeCompra.fecha)
 *    + salida por venta o consumo en OdR (RepuestoUsado + OrdenReparacion.fechaCreacion / Venta.fecha)
 *    con los mismos filtros de estado que se usan en el resto de las estadísticas:
 *      OdR: estado IN ('Terminado', 'SeRetira')
 *      Venta: estado IN ('Entregado', 'Cerrado')
 *  - "Días promedio en stock" = (stockActual * 365) / unidadesVendidasUltimos365Dias.
 *    Usamos `Stock.units` actual como proxy del inventario promedio del período: el modelo
 *    no guarda snapshots históricos, así que es la aproximación estándar cuando solo hay
 *    ledger de movimientos. NULL si no hubo ventas en el último año.
 *  - Buckets de inactividad acumulativos: ≥90 incluye a ≥180 que incluye a ≥365.
 *
 * Implementación:
 *  Usamos derived tables con LEFT JOIN (no subqueries correlacionadas) porque MySQL no
 *  soporta correlación a la outer query dentro de subqueries con UNION ALL. El MAX de las
 *  3 fechas (compra/OdR/venta) se calcula en JS para evitar el lío de NULL/GREATEST.
 */

import { prisma } from "@/core/infrastructure/database/prisma";

export interface RotacionKpis {
  totalProductosConStock: number;
  productosSinMov90: number;
  productosSinMov180: number;
  productosSinMov365: number;
  diasPromedioStockGlobal: number;
}

export interface ProductoRotacion {
  stockId: number;
  nombre: string;
  marca: string;
  proveedor: string | null;
  sector: string | null;
  stockActual: number;
  unidadesVendidas365: number;
  diasPromedioStock: number | null;
  fechaUltimoMovimiento: Date | null;
  diasDesdeUltimoMovimiento: number | null;
}

interface RotacionRow {
  stockId: number;
  nombre: string;
  marca: string;
  proveedor: string | null;
  sector: string | null;
  stockActual: unknown;
  unidadesVendidas365: unknown;
  ultimaCompra: Date | null;
  ultimaOdr: Date | null;
  ultimaVenta: Date | null;
}

export async function getProductosRotacion(opts: { soloConStock?: boolean } = {}): Promise<ProductoRotacion[]> {
  const soloConStock = opts.soloConStock ?? true;

  const rows = soloConStock
    ? await prisma.$queryRaw<RotacionRow[]>`
        SELECT
          s.id AS stockId,
          s.name AS nombre,
          COALESCE(s.brand, '') AS marca,
          p.name AS proveedor,
          s.sector AS sector,
          COALESCE(s.units, 0) AS stockActual,
          COALESCE(vendidas.total, 0) AS unidadesVendidas365,
          compras.maxFecha AS ultimaCompra,
          odr.maxFecha AS ultimaOdr,
          ventas.maxFecha AS ultimaVenta
        FROM Stock s
        LEFT JOIN Proveedor p ON p.id = s.proveedorId
        LEFT JOIN (
          SELECT oci.stockId, MAX(oc.fecha) AS maxFecha
          FROM OrdenDeCompraItem oci
          JOIN OrdenDeCompra oc ON oc.id = oci.ordenDeCompraId
          GROUP BY oci.stockId
        ) compras ON compras.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, MAX(o.fechaCreacion) AS maxFecha
          FROM RepuestoUsado r
          JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
          WHERE o.estado IN ('Terminado', 'SeRetira')
          GROUP BY r.stockId
        ) odr ON odr.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, MAX(v.fecha) AS maxFecha
          FROM RepuestoUsado r
          JOIN Venta v ON v.id = r.ventaId
          WHERE v.estado IN ('Entregado', 'Cerrado')
          GROUP BY r.stockId
        ) ventas ON ventas.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, SUM(r.unidadesConsumidas) AS total
          FROM RepuestoUsado r
          LEFT JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
          LEFT JOIN Venta v ON v.id = r.ventaId
          WHERE (
            (r.ordenReparacionId IS NOT NULL AND o.estado IN ('Terminado', 'SeRetira')
              AND o.fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL 365 DAY))
            OR
            (r.ventaId IS NOT NULL AND v.estado IN ('Entregado', 'Cerrado')
              AND v.fecha >= DATE_SUB(CURDATE(), INTERVAL 365 DAY))
          )
          GROUP BY r.stockId
        ) vendidas ON vendidas.stockId = s.id
        WHERE s.units > 0
        LIMIT 2000
      `
    : await prisma.$queryRaw<RotacionRow[]>`
        SELECT
          s.id AS stockId,
          s.name AS nombre,
          COALESCE(s.brand, '') AS marca,
          p.name AS proveedor,
          s.sector AS sector,
          COALESCE(s.units, 0) AS stockActual,
          COALESCE(vendidas.total, 0) AS unidadesVendidas365,
          compras.maxFecha AS ultimaCompra,
          odr.maxFecha AS ultimaOdr,
          ventas.maxFecha AS ultimaVenta
        FROM Stock s
        LEFT JOIN Proveedor p ON p.id = s.proveedorId
        LEFT JOIN (
          SELECT oci.stockId, MAX(oc.fecha) AS maxFecha
          FROM OrdenDeCompraItem oci
          JOIN OrdenDeCompra oc ON oc.id = oci.ordenDeCompraId
          GROUP BY oci.stockId
        ) compras ON compras.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, MAX(o.fechaCreacion) AS maxFecha
          FROM RepuestoUsado r
          JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
          WHERE o.estado IN ('Terminado', 'SeRetira')
          GROUP BY r.stockId
        ) odr ON odr.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, MAX(v.fecha) AS maxFecha
          FROM RepuestoUsado r
          JOIN Venta v ON v.id = r.ventaId
          WHERE v.estado IN ('Entregado', 'Cerrado')
          GROUP BY r.stockId
        ) ventas ON ventas.stockId = s.id
        LEFT JOIN (
          SELECT r.stockId, SUM(r.unidadesConsumidas) AS total
          FROM RepuestoUsado r
          LEFT JOIN OrdenReparacion o ON o.id = r.ordenReparacionId
          LEFT JOIN Venta v ON v.id = r.ventaId
          WHERE (
            (r.ordenReparacionId IS NOT NULL AND o.estado IN ('Terminado', 'SeRetira')
              AND o.fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL 365 DAY))
            OR
            (r.ventaId IS NOT NULL AND v.estado IN ('Entregado', 'Cerrado')
              AND v.fecha >= DATE_SUB(CURDATE(), INTERVAL 365 DAY))
          )
          GROUP BY r.stockId
        ) vendidas ON vendidas.stockId = s.id
        LIMIT 2000
      `;

  const hoy = Date.now();
  const productos: ProductoRotacion[] = rows.map((r) => {
    const stockActual = Number(r.stockActual ?? 0);
    const vendidas = Number(r.unidadesVendidas365 ?? 0);
    const diasPromedioStock =
      vendidas > 0 ? Math.round((stockActual * 365) / vendidas) : null;

    const fechas = [r.ultimaCompra, r.ultimaOdr, r.ultimaVenta]
      .filter((f): f is Date => f != null)
      .map((f) => (f instanceof Date ? f : new Date(f as string)));
    const fechaUltimoMovimiento =
      fechas.length > 0
        ? new Date(Math.max(...fechas.map((f) => f.getTime())))
        : null;
    const diasDesdeUltimoMovimiento =
      fechaUltimoMovimiento != null
        ? Math.floor((hoy - fechaUltimoMovimiento.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return {
      stockId: Number(r.stockId),
      nombre: r.nombre,
      marca: r.marca,
      proveedor: r.proveedor,
      sector: r.sector,
      stockActual,
      unidadesVendidas365: vendidas,
      diasPromedioStock,
      fechaUltimoMovimiento,
      diasDesdeUltimoMovimiento,
    };
  });

  // Orden: los que más rotan arriba (más unidades vendidas en el último año),
  // los sin ventas al final. Tie-breaker: última actividad más reciente primero.
  productos.sort((a, b) => {
    if (b.unidadesVendidas365 !== a.unidadesVendidas365) {
      return b.unidadesVendidas365 - a.unidadesVendidas365;
    }
    const aDias = a.diasDesdeUltimoMovimiento ?? Number.MAX_SAFE_INTEGER;
    const bDias = b.diasDesdeUltimoMovimiento ?? Number.MAX_SAFE_INTEGER;
    return aDias - bDias;
  });

  return productos;
}

export function computeRotacionKpis(productos: ProductoRotacion[]): RotacionKpis {
  let sin90 = 0;
  let sin180 = 0;
  let sin365 = 0;
  let sumDias = 0;
  let countConDias = 0;

  for (const p of productos) {
    // Productos que nunca tuvieron movimiento cuentan como ≥365 (caso peor).
    const inactivo = p.diasDesdeUltimoMovimiento ?? Infinity;
    if (inactivo >= 90) sin90++;
    if (inactivo >= 180) sin180++;
    if (inactivo >= 365) sin365++;
    if (p.diasPromedioStock != null) {
      sumDias += p.diasPromedioStock;
      countConDias++;
    }
  }

  return {
    totalProductosConStock: productos.length,
    productosSinMov90: sin90,
    productosSinMov180: sin180,
    productosSinMov365: sin365,
    diasPromedioStockGlobal: countConDias > 0 ? Math.round(sumDias / countConDias) : 0,
  };
}
