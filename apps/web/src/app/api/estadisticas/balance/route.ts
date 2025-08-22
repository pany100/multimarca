import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface VentasResult {
  totalVentas: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

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
    `;

    const queryParams: any[] = [moneda];

    // Aplicar filtros de fecha si es necesario
    if (año && mes) {
      ventasQuery += ` AND v.fecha >= ? AND v.fecha < ?`;
      queryParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      ventasQuery += ` AND YEAR(v.fecha) = ?`;
      queryParams.push(año);
    }

    const [ventasResult] = await prisma.$queryRawUnsafe<VentasResult[]>(
      ventasQuery,
      ...queryParams
    );

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
    `;

    const reparacionesParams: any[] = [moneda];

    if (año && mes) {
      reparacionesQuery += ` AND orep.fechaCreacion >= ? AND orep.fechaCreacion < ?`;
      reparacionesParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      reparacionesQuery += ` AND YEAR(orep.fechaCreacion) = ?`;
      reparacionesParams.push(año);
    }

    const [reparacionesResult] = await prisma.$queryRawUnsafe<
      {
        totalReparaciones: number;
      }[]
    >(reparacionesQuery, ...reparacionesParams);

    let ingresosManualesQuery = `
    SELECT 
        ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              CASE 
                WHEN i.moneda = 'Dolar' THEN i.monto
                ELSE i.monto / COALESCE(d.blue, 1)
              END
            ELSE 
              CASE 
                WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(d.blue, 1)
                ELSE i.monto
              END
          END
        )) as totalIngresos
      FROM IngresoManualDeDinero i
      LEFT JOIN Dolar d ON d.id = i.dolarId
      WHERE 1=1
    `;

    const ingresosManualesParams: any[] = [moneda];

    if (año && mes) {
      ingresosManualesQuery += ` AND i.fecha >= ? AND i.fecha < ?`;
      ingresosManualesParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      ingresosManualesQuery += ` AND YEAR(i.fecha) = ?`;
      ingresosManualesParams.push(año);
    }

    const [ingresosManualesResult] = await prisma.$queryRawUnsafe<
      { totalIngresos: number }[]
    >(ingresosManualesQuery, ...ingresosManualesParams);

    // Consulta para gastos
    let gastosQuery = `
      SELECT ROUND(SUM(
        CASE 
          WHEN ? = 'USD' THEN 
            CASE
              WHEN g.moneda = 'Dolar' THEN g.precio
              ELSE g.precio / COALESCE(d.blue, 1)
            END
        ELSE 
          CASE
            WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(d.blue, 1)
              ELSE g.precio
            END
        END
      )) as totalGastos
      FROM Gasto g
      LEFT JOIN Dolar d ON d.id = g.dolarId
      WHERE 1=1
    `;

    const gastosParams: any[] = [moneda];

    if (año && mes) {
      gastosQuery += ` AND g.fecha >= ? AND g.fecha < ?`;
      gastosParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      gastosQuery += ` AND YEAR(g.fecha) = ?`;
      gastosParams.push(año);
    }

    const [gastosResult] = await prisma.$queryRawUnsafe<
      { totalGastos: number }[]
    >(gastosQuery, ...gastosParams);

    const ingresos =
      Number(ventasResult?.totalVentas || 0) +
      Number(reparacionesResult?.totalReparaciones || 0) +
      Number(ingresosManualesResult?.totalIngresos || 0);
    const gastos = Number(gastosResult?.totalGastos || 0);

    return NextResponse.json({
      ingresos: Number(ingresos.toFixed(2)),
      gastos: Number(gastos.toFixed(2)),
      balance: Number((ingresos - gastos).toFixed(2)),
      moneda: moneda,
    });
  } catch (error) {
    console.error("Error al obtener el balance:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
