import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface WeeklyBalanceResult {
  weekStart: string;
  weekEnd: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    // Calcular las fechas para las últimas 10 semanas
    const today = new Date();
    const weeks: { start: Date; end: Date }[] = [];

    for (let i = 0; i < 10; i++) {
      // Calcular el inicio de la semana (10-i semanas atrás)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + (today.getDay() || 7)));
      weekStart.setHours(0, 0, 0, 0);

      // Calcular el fin de la semana
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      weeks.push({ start: weekStart, end: weekEnd });
    }

    // Ordenar las semanas de más antigua a más reciente
    weeks.reverse();

    const weeklyResults: WeeklyBalanceResult[] = [];

    // Procesar cada semana
    for (const week of weeks) {
      const startDate = week.start.toISOString().split("T")[0];
      const endDate = week.end.toISOString().split("T")[0];

      // Consulta para ventas
      let ventasQuery = `
        SELECT ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta + ru.precioVenta * (v.porcentajeRecargo / 100)) FROM RepuestoUsado ru WHERE ru.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta + rt.precioVenta * (v.porcentajeRecargo / 100)) FROM ReparacionDeTercero rt WHERE rt.ventaId = v.id), 0) + 
               COALESCE(v.incremento, 0) - 
               COALESCE(v.descuento, 0)
              ) / COALESCE(d.blue, 1)
            ELSE 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta + ru.precioVenta * (v.porcentajeRecargo / 100)) FROM RepuestoUsado ru WHERE ru.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta + rt.precioVenta * (v.porcentajeRecargo / 100)) FROM ReparacionDeTercero rt WHERE rt.ventaId = v.id), 0) + 
               COALESCE(v.incremento, 0) - 
               COALESCE(v.descuento, 0)
              )
          END
        )) as totalVentas
        FROM Venta v
        LEFT JOIN Dolar d ON d.fecha = DATE(v.fecha)
        WHERE v.estado = 'Entregado'
        AND v.fecha >= ? AND v.fecha <= ?
      `;

      const ventasParams = [moneda, startDate, endDate];

      const [ventasResult] = await prisma.$queryRawUnsafe<
        { totalVentas: number }[]
      >(ventasQuery, ...ventasParams);

      // Consulta para reparaciones
      let reparacionesQuery = `
        SELECT ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta + ru.precioVenta * (orep.porcentajeRecargo / 100)) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta + rt.precioVenta * (orep.porcentajeRecargo / 100)) FROM ReparacionDeTercero rt WHERE rt.ordenReparacionId = orep.id), 0) - 
               COALESCE(orep.descuento, 0)
              ) / COALESCE(d.blue, 1)
            ELSE 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta + ru.precioVenta * (orep.porcentajeRecargo / 100)) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta + rt.precioVenta * (orep.porcentajeRecargo / 100)) FROM ReparacionDeTercero rt WHERE rt.ordenReparacionId = orep.id), 0) - 
               COALESCE(orep.descuento, 0)
              )
          END
        )) as totalReparaciones
        FROM OrdenReparacion orep
        LEFT JOIN Dolar d ON d.id = orep.dolarId
        WHERE orep.estado = 'Terminado'
        AND orep.fechaCreacion >= ? AND orep.fechaCreacion <= ?
      `;

      const reparacionesParams = [moneda, startDate, endDate];

      const [reparacionesResult] = await prisma.$queryRawUnsafe<
        { totalReparaciones: number }[]
      >(reparacionesQuery, ...reparacionesParams);

      // Consulta para ingresos manuales
      let ingresosManualesQuery = `
        SELECT 
          ROUND(SUM(
            CASE 
              WHEN ? = 'USD' THEN 
                CASE 
                  WHEN i.moneda = 'Dolar' THEN i.monto - i.gastosBancarios
                  ELSE (i.monto  - i.gastosBancarios) / COALESCE(i.cotizacionDolar, 1)
                END
              ELSE 
                CASE 
                  WHEN i.moneda = 'Dolar' THEN (i.monto - i.gastosBancarios) * COALESCE(i.cotizacionDolar, 1)
                  ELSE i.monto - i.gastosBancarios
                END
            END
          )) as totalIngresos
        FROM IngresoManualDeDinero i
        WHERE i.fecha >= ? AND i.fecha <= ?
      `;

      const ingresosManualesParams = [moneda, startDate, endDate];

      const [ingresosManualesResult] = await prisma.$queryRawUnsafe<
        { totalIngresos: number }[]
      >(ingresosManualesQuery, ...ingresosManualesParams);

      // Consulta para gastos
      let gastosQuery = `
        SELECT ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              CASE
                WHEN g.moneda = 'Dolar' THEN (g.precio + g.gastosBancarios)
                ELSE (g.precio + g.gastosBancarios) / COALESCE(g.cotizacionDolar, 1)
              END
          ELSE 
            CASE
              WHEN g.moneda = 'Dolar' THEN (g.precio + g.gastosBancarios) * COALESCE(g.cotizacionDolar, 1)
              ELSE (g.precio + g.gastosBancarios)
            END
          END
        )) as totalGastos
        FROM Gasto g
        WHERE g.fecha >= ? AND g.fecha <= ?
      `;

      const gastosParams = [moneda, startDate, endDate];

      const [gastosResult] = await prisma.$queryRawUnsafe<
        { totalGastos: number }[]
      >(gastosQuery, ...gastosParams);

      const ingresos =
        Number(ventasResult?.totalVentas || 0) +
        Number(reparacionesResult?.totalReparaciones || 0) +
        Number(ingresosManualesResult?.totalIngresos || 0);
      const gastos = Number(gastosResult?.totalGastos || 0);

      weeklyResults.push({
        weekStart: startDate,
        weekEnd: endDate,
        ingresos: Number(ingresos.toFixed(2)),
        gastos: Number(gastos.toFixed(2)),
        balance: Number((ingresos - gastos).toFixed(2)),
      });
    }

    return NextResponse.json({
      data: weeklyResults,
      moneda: moneda,
    });
  } catch (error) {
    console.error("Error al obtener el balance detallado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
