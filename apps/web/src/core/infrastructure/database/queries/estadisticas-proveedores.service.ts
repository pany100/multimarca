import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

/** Totales del período: dinero y conteos (1 OC = 1, cada línea rep. tercero = 1). */
export type TotalProveedoresResult = {
  totalGlobal: number;
  cantidadOrdenesCompra: number;
  cantidadReparacionesTerceroOrden: number;
  cantidadReparacionesTerceroVenta: number;
  cantidadTotal: number;
};

export type TopProveedorAgg = {
  proveedorId: number;
  proveedorNombre: string;
  totalGastado: number;
  cantidadOrdenesCompra: number;
  cantidadReparacionesTerceroOrden: number;
  cantidadReparacionesTerceroVenta: number;
  cantidadTotal: number;
};

type SumCountRow = {
  suma: number | bigint | string | null;
  cnt: number | bigint | string;
};

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "bigint") return Number(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** MySQL suele devolver alias en minúscula; Prisma puede usar el alias tal cual. */
function rowPick<T = unknown>(
  r: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const k of keys) {
    const direct = r[k];
    if (direct !== undefined && direct !== null) return direct as T;
    const lower = r[k.toLowerCase()];
    if (lower !== undefined && lower !== null) return lower as T;
  }
  return undefined;
}

function parseSumCount(row: SumCountRow | undefined): { suma: number; cnt: number } {
  if (!row) return { suma: 0, cnt: 0 };
  const raw = row as unknown as Record<string, unknown>;
  return {
    suma: num(rowPick(raw, "suma", "SUM")),
    cnt: num(rowPick(raw, "cnt", "COUNT")),
  };
}

function parseGroupRow(r: unknown): {
  proveedorId: number;
  proveedorNombre: string | null;
  monto: number;
  cnt: number;
} {
  const row = r as Record<string, unknown>;
  return {
    proveedorId: num(
      rowPick(row, "proveedor_id", "proveedorId", "proveedorid")
    ),
    proveedorNombre:
      (rowPick<string | null>(
        row,
        "proveedor_nombre",
        "proveedorNombre",
        "proveedornombre"
      ) as string | null) ?? null,
    monto: num(rowPick(row, "monto", "montoOc", "montoRt", "monto_oc", "monto_rt")),
    cnt: num(rowPick(row, "cnt", "cntOc", "cntRt", "cnt_oc", "cnt_rt")),
  };
}

function recomputeTotal(a: TopProveedorAgg) {
  a.cantidadTotal =
    a.cantidadOrdenesCompra +
    a.cantidadReparacionesTerceroOrden +
    a.cantidadReparacionesTerceroVenta;
}

export class EstadisticasProveedoresService {
  /**
   * - OrdenDeCompra: precioTotal, fecha = oc.fecha
   * - Rep. tercero en orden: precioCompra, fecha = orden.fechaCreacion
   * - Rep. tercero solo en venta: precioCompra, fecha = venta.fecha (sin contar dos veces si también tiene orden)
   */
  async getTotalProveedores(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<TotalProveedoresResult> {
    const [ocRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT
        COALESCE(SUM(oc.precioTotal), 0) AS suma,
        COUNT(*) AS cnt
      FROM OrdenDeCompra oc
      WHERE 1 = 1
      ${from ? Prisma.sql`AND DATE(oc.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(oc.fecha) <= DATE(${to})` : Prisma.empty}
    `;

    const [rtOrdenRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT
        COALESCE(SUM(rt.precioCompra), 0) AS suma,
        COUNT(*) AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN OrdenReparacion o ON o.id = rt.ordenReparacionId
      WHERE rt.ordenReparacionId IS NOT NULL
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= DATE(${to})` : Prisma.empty}
    `;

    const [rtVentaRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT
        COALESCE(SUM(rt.precioCompra), 0) AS suma,
        COUNT(*) AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN Venta v ON v.id = rt.ventaId
      WHERE rt.ventaId IS NOT NULL
        AND rt.ordenReparacionId IS NULL
      ${from ? Prisma.sql`AND DATE(v.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(v.fecha) <= DATE(${to})` : Prisma.empty}
    `;

    const oc = parseSumCount(ocRow);
    const rtO = parseSumCount(rtOrdenRow);
    const rtV = parseSumCount(rtVentaRow);

    const cantidadOrdenesCompra = oc.cnt;
    const cantidadReparacionesTerceroOrden = rtO.cnt;
    const cantidadReparacionesTerceroVenta = rtV.cnt;

    return {
      totalGlobal: oc.suma + rtO.suma + rtV.suma,
      cantidadOrdenesCompra,
      cantidadReparacionesTerceroOrden,
      cantidadReparacionesTerceroVenta,
      cantidadTotal:
        cantidadOrdenesCompra +
        cantidadReparacionesTerceroOrden +
        cantidadReparacionesTerceroVenta,
    };
  }

  async getTopProveedores(
    from: Date | undefined,
    to: Date | undefined,
    limit = 20,
  ): Promise<TopProveedorAgg[]> {
    const ocRows = await prisma.$queryRaw<unknown[]>`
      SELECT
        oc.proveedorId AS proveedor_id,
        p.name AS proveedor_nombre,
        COALESCE(SUM(oc.precioTotal), 0) AS monto,
        COUNT(*) AS cnt
      FROM OrdenDeCompra oc
      INNER JOIN Proveedor p ON p.id = oc.proveedorId
      WHERE 1 = 1
      ${from ? Prisma.sql`AND DATE(oc.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(oc.fecha) <= DATE(${to})` : Prisma.empty}
      GROUP BY oc.proveedorId, p.name
    `;

    const rtOrdenRows = await prisma.$queryRaw<unknown[]>`
      SELECT
        rt.proveedorId AS proveedor_id,
        p.name AS proveedor_nombre,
        COALESCE(SUM(rt.precioCompra), 0) AS monto,
        COUNT(*) AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN OrdenReparacion o ON o.id = rt.ordenReparacionId
      INNER JOIN Proveedor p ON p.id = rt.proveedorId
      WHERE rt.ordenReparacionId IS NOT NULL
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= DATE(${to})` : Prisma.empty}
      GROUP BY rt.proveedorId, p.name
    `;

    const rtVentaRows = await prisma.$queryRaw<unknown[]>`
      SELECT
        rt.proveedorId AS proveedor_id,
        p.name AS proveedor_nombre,
        COALESCE(SUM(rt.precioCompra), 0) AS monto,
        COUNT(*) AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN Venta v ON v.id = rt.ventaId
      INNER JOIN Proveedor p ON p.id = rt.proveedorId
      WHERE rt.ventaId IS NOT NULL
        AND rt.ordenReparacionId IS NULL
      ${from ? Prisma.sql`AND DATE(v.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(v.fecha) <= DATE(${to})` : Prisma.empty}
      GROUP BY rt.proveedorId, p.name
    `;

    const map = new Map<number, TopProveedorAgg>();

    const touch = (
      id: number,
      nombre: string | null,
      patch: Partial<TopProveedorAgg>,
    ) => {
      if (!id || id < 1) return;
      const name = nombre ?? "Sin nombre";
      const cur = map.get(id);
      if (!cur) {
        const next: TopProveedorAgg = {
          proveedorId: id,
          proveedorNombre: name,
          totalGastado: 0,
          cantidadOrdenesCompra: 0,
          cantidadReparacionesTerceroOrden: 0,
          cantidadReparacionesTerceroVenta: 0,
          cantidadTotal: 0,
          ...patch,
        };
        recomputeTotal(next);
        map.set(id, next);
        return;
      }
      if (nombre && cur.proveedorNombre === "Sin nombre") {
        cur.proveedorNombre = name;
      }
      if (patch.totalGastado !== undefined) {
        cur.totalGastado += patch.totalGastado;
      }
      if (patch.cantidadOrdenesCompra !== undefined) {
        cur.cantidadOrdenesCompra += patch.cantidadOrdenesCompra;
      }
      if (patch.cantidadReparacionesTerceroOrden !== undefined) {
        cur.cantidadReparacionesTerceroOrden +=
          patch.cantidadReparacionesTerceroOrden;
      }
      if (patch.cantidadReparacionesTerceroVenta !== undefined) {
        cur.cantidadReparacionesTerceroVenta +=
          patch.cantidadReparacionesTerceroVenta;
      }
      recomputeTotal(cur);
    };

    for (const raw of ocRows) {
      const r = parseGroupRow(raw);
      touch(r.proveedorId, r.proveedorNombre, {
        totalGastado: r.monto,
        cantidadOrdenesCompra: r.cnt,
      });
    }

    for (const raw of rtOrdenRows) {
      const r = parseGroupRow(raw);
      touch(r.proveedorId, r.proveedorNombre, {
        totalGastado: r.monto,
        cantidadReparacionesTerceroOrden: r.cnt,
      });
    }

    for (const raw of rtVentaRows) {
      const r = parseGroupRow(raw);
      touch(r.proveedorId, r.proveedorNombre, {
        totalGastado: r.monto,
        cantidadReparacionesTerceroVenta: r.cnt,
      });
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, limit);
  }

  /** Composición del gasto: cuánto viene de OC vs Rep. tercero (orden) vs Rep. tercero (venta). */
  async getComposicion(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<{ label: string; total: number }[]> {
    const [ocRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT COALESCE(SUM(oc.precioTotal), 0) AS suma, 0 AS cnt
      FROM OrdenDeCompra oc
      WHERE 1 = 1
      ${from ? Prisma.sql`AND DATE(oc.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(oc.fecha) <= DATE(${to})` : Prisma.empty}
    `;
    const [rtOrdenRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT COALESCE(SUM(rt.precioCompra), 0) AS suma, 0 AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN OrdenReparacion o ON o.id = rt.ordenReparacionId
      WHERE rt.ordenReparacionId IS NOT NULL
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= DATE(${to})` : Prisma.empty}
    `;
    const [rtVentaRow] = await prisma.$queryRaw<SumCountRow[]>`
      SELECT COALESCE(SUM(rt.precioCompra), 0) AS suma, 0 AS cnt
      FROM ReparacionDeTercero rt
      INNER JOIN Venta v ON v.id = rt.ventaId
      WHERE rt.ventaId IS NOT NULL AND rt.ordenReparacionId IS NULL
      ${from ? Prisma.sql`AND DATE(v.fecha) >= DATE(${from})` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(v.fecha) <= DATE(${to})` : Prisma.empty}
    `;

    return [
      { label: "Órdenes de compra", total: parseSumCount(ocRow).suma },
      { label: "Rep. tercero (OdR)", total: parseSumCount(rtOrdenRow).suma },
      { label: "Rep. tercero (Ventas)", total: parseSumCount(rtVentaRow).suma },
    ].filter((c) => c.total > 0);
  }

  /** Evolución mensual de los últimos 6 meses. Usa una sola query agrupando por mes. */
  async getEvolucion(
    to: Date | undefined,
  ): Promise<{ label: string; ordenesCompra: number; reparacionesTercero: number; total: number }[]> {
    const refDate = to ?? new Date();
    const sixMonthsAgo = new Date(refDate.getFullYear(), refDate.getMonth() - 5, 1);

    type MonthRow = { mes: string; suma: number | bigint | string | null };

    const [ocRows, rtRows] = await Promise.all([
      prisma.$queryRaw<MonthRow[]>`
        SELECT DATE_FORMAT(oc.fecha, '%Y-%m') AS mes,
               COALESCE(SUM(oc.precioTotal), 0) AS suma
        FROM OrdenDeCompra oc
        WHERE DATE(oc.fecha) >= DATE(${sixMonthsAgo})
          AND DATE(oc.fecha) <= DATE(${refDate})
        GROUP BY mes ORDER BY mes
      `,
      prisma.$queryRaw<MonthRow[]>`
        SELECT DATE_FORMAT(COALESCE(o.fechaCreacion, v.fecha), '%Y-%m') AS mes,
               COALESCE(SUM(rt.precioCompra), 0) AS suma
        FROM ReparacionDeTercero rt
        LEFT JOIN OrdenReparacion o ON o.id = rt.ordenReparacionId
        LEFT JOIN Venta v ON v.id = rt.ventaId
        WHERE (rt.ordenReparacionId IS NOT NULL OR rt.ventaId IS NOT NULL)
          AND DATE(COALESCE(o.fechaCreacion, v.fecha)) >= DATE(${sixMonthsAgo})
          AND DATE(COALESCE(o.fechaCreacion, v.fecha)) <= DATE(${refDate})
        GROUP BY mes ORDER BY mes
      `,
    ]);

    const ocMap = new Map(ocRows.map((r) => [r.mes, num(r.suma)]));
    const rtMap = new Map(rtRows.map((r) => [r.mes, num(r.suma)]));

    const results: { label: string; ordenesCompra: number; reparacionesTercero: number; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
      const oc = ocMap.get(key) ?? 0;
      const rt = rtMap.get(key) ?? 0;
      results.push({ label, ordenesCompra: oc, reparacionesTercero: rt, total: oc + rt });
    }
    return results;
  }
}
