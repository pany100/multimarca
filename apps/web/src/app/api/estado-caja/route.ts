import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface EstadoCajaRow {
  tipoOperacionId: number;
  label: string;
  cantidadIngresos: number;
  totalIngresos: number;
  cantidadEgresos: number;
  totalEgresos: number;
  saldo: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    const dateFilter =
      from && to ? { from: `${from} 00:00:00`, to: `${to} 23:59:59` } : null;

    const fRep = dateFilter
      ? ` AND i.fecha >= '${dateFilter.from}' AND i.fecha <= '${dateFilter.to}'`
      : "";
    const fVenta = dateFilter
      ? ` AND i.fecha >= '${dateFilter.from}' AND i.fecha <= '${dateFilter.to}'`
      : "";
    const fManual = dateFilter
      ? ` AND i.fecha >= '${dateFilter.from}' AND i.fecha <= '${dateFilter.to}'`
      : "";
    const fGasto = dateFilter
      ? ` AND g.fecha >= '${dateFilter.from}' AND g.fecha <= '${dateFilter.to}'`
      : "";
    const fExt = dateFilter
      ? ` AND e.fecha >= '${dateFilter.from}' AND e.fecha <= '${dateFilter.to}'`
      : "";

    const convIngreso =
      moneda === "ARS"
        ? "CASE WHEN i.moneda = 'Dolar' THEN (i.monto - COALESCE(i.gastosBancarios,0)) * COALESCE(i.cotizacionDolar, 1) ELSE (i.monto - COALESCE(i.gastosBancarios,0)) END"
        : "CASE WHEN i.moneda = 'Dolar' THEN (i.monto - COALESCE(i.gastosBancarios,0)) ELSE (i.monto - COALESCE(i.gastosBancarios,0)) / COALESCE(i.cotizacionDolar, 1) END";
    const convGasto =
      moneda === "ARS"
        ? "CASE WHEN g.moneda = 'Dolar' THEN (g.precio + COALESCE(g.gastosBancarios,0)) * COALESCE(g.cotizacionDolar, 1) ELSE (g.precio + COALESCE(g.gastosBancarios,0)) END"
        : "CASE WHEN g.moneda = 'Dolar' THEN (g.precio + COALESCE(g.gastosBancarios,0)) ELSE (g.precio + COALESCE(g.gastosBancarios,0)) / COALESCE(g.cotizacionDolar, 1) END";
    const convExtraccion =
      moneda === "ARS"
        ? "CASE WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1) ELSE e.monto END"
        : "CASE WHEN e.moneda = 'Dolar' THEN e.monto ELSE e.monto / COALESCE(e.cotizacionDolar, 1) END";

    const query = `
      WITH mov AS (
        SELECT i.tipoOperacionId, (${convIngreso}) AS monto, 1 AS ingreso
        FROM IngresoPorReparacion i WHERE 1=1 ${fRep}
        UNION ALL
        SELECT i.tipoOperacionId, (${convIngreso}) AS monto, 1 AS ingreso
        FROM IngresoPorVenta i WHERE 1=1 ${fVenta}
        UNION ALL
        SELECT i.tipoOperacionId, (${convIngreso}) AS monto, 1 AS ingreso
        FROM IngresoManualDeDinero i WHERE 1=1 ${fManual}
        UNION ALL
        SELECT g.tipoOperacionId, (${convGasto}) AS monto, 0 AS ingreso
        FROM Gasto g WHERE 1=1 ${fGasto}
        UNION ALL
        SELECT e.tipoOperacionId, (${convExtraccion}) AS monto, 0 AS ingreso
        FROM Extraccion e WHERE 1=1 ${fExt}
      )
      SELECT
        mov.tipoOperacionId,
        t.label,
        CAST(SUM(CASE WHEN mov.ingreso = 1 THEN 1 ELSE 0 END) AS UNSIGNED) AS cantidadIngresos,
        ROUND(COALESCE(SUM(CASE WHEN mov.ingreso = 1 THEN mov.monto ELSE 0 END), 0), 2) AS totalIngresos,
        CAST(SUM(CASE WHEN mov.ingreso = 0 THEN 1 ELSE 0 END) AS UNSIGNED) AS cantidadEgresos,
        ROUND(COALESCE(SUM(CASE WHEN mov.ingreso = 0 THEN mov.monto ELSE 0 END), 0), 2) AS totalEgresos,
        ROUND(COALESCE(SUM(CASE WHEN mov.ingreso = 1 THEN mov.monto ELSE -mov.monto END), 0), 2) AS saldo
      FROM mov
      LEFT JOIN TipoDeOperacion t ON t.id = mov.tipoOperacionId
      GROUP BY mov.tipoOperacionId, t.label
      ORDER BY t.label
    `;

    const rawRows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      query
    );

    const items: EstadoCajaRow[] = rawRows.map((row) => ({
      tipoOperacionId: Number(row.tipoOperacionId),
      label: String(row.label ?? ""),
      cantidadIngresos: Number(row.cantidadIngresos),
      totalIngresos: Number(row.totalIngresos),
      cantidadEgresos: Number(row.cantidadEgresos),
      totalEgresos: Number(row.totalEgresos),
      saldo: Number(row.saldo),
    }));

    return NextResponse.json({
      items,
      moneda,
      from: from ?? null,
      to: to ?? null,
    });
  } catch (e) {
    console.error("Error estado caja:", e);
    return NextResponse.json(
      { error: "Error al obtener el estado de caja" },
      { status: 500 }
    );
  }
}
