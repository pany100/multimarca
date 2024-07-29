import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    // Construir la consulta SQL base para ventas
    let ventasQuery = `
      SELECT 
        ROUND(SUM(CASE 
          WHEN ? = 'USD' THEN v.total / COALESCE(
            (SELECT d.blue 
             FROM Dolar d 
             WHERE DATE(d.fecha) <= DATE(v.fecha) 
             ORDER BY d.fecha DESC 
             LIMIT 1), 
            1)
          ELSE v.total 
        END)) as totalVentas
      FROM Venta v
      WHERE 1=1
    `;

    const queryParams: any[] = [moneda];

    // Aplicar filtros de fecha si es necesario
    if (año && mes) {
      ventasQuery += ` AND v.fecha >= ? AND v.fecha < ?`;
      queryParams.push(`${año}-${mes}-01`, `${año}-${parseInt(mes) + 1}-01`);
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
            (orep.manoDeObra + 
             COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
             COALESCE((SELECT SUM(rt.precioVenta) FROM _OrdenReparacionReparacionTercero orrt 
                       JOIN ReparacionDeTercero rt ON orrt.B = rt.id 
                       WHERE orrt.A = orep.id), 0)
            ) / 
            COALESCE(
              (SELECT d.blue 
               FROM Dolar d 
               WHERE DATE(d.fecha) <= DATE(orep.fechaCreacion) 
               ORDER BY d.fecha DESC 
               LIMIT 1), 
              1)
          ELSE 
            (orep.manoDeObra + 
             COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
             COALESCE((SELECT SUM(rt.precioVenta) FROM _OrdenReparacionReparacionTercero orrt 
                       JOIN ReparacionDeTercero rt ON orrt.B = rt.id 
                       WHERE orrt.A = orep.id), 0)
            )
        END
      )) as totalReparaciones
      FROM OrdenReparacion orep
      WHERE orep.estado != 'Presupuestado'
    `;

    const reparacionesParams: any[] = [moneda];

    if (año && mes) {
      reparacionesQuery += ` AND orep.fechaCreacion >= ? AND orep.fechaCreacion < ?`;
      reparacionesParams.push(
        `${año}-${mes}-01`,
        `${año}-${parseInt(mes) + 1}-01`
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

    // Consulta para gastos
    let gastosQuery = `
      SELECT ROUND(SUM(
        CASE 
          WHEN ? = 'USD' THEN 
            g.precio / COALESCE(
              (SELECT d.blue 
               FROM Dolar d 
               WHERE DATE(d.fecha) <= DATE(g.fecha) 
               ORDER BY d.fecha DESC 
               LIMIT 1), 
              1)
          ELSE g.precio
        END
      )) as totalGastos
      FROM Gasto g
      WHERE 1=1
    `;

    const gastosParams: any[] = [moneda];

    if (año && mes) {
      gastosQuery += ` AND g.fecha >= ? AND g.fecha < ?`;
      gastosParams.push(`${año}-${mes}-01`, `${año}-${parseInt(mes) + 1}-01`);
    } else if (año) {
      gastosQuery += ` AND YEAR(g.fecha) = ?`;
      gastosParams.push(año);
    }

    const [gastosResult] = await prisma.$queryRawUnsafe<
      { totalGastos: number }[]
    >(gastosQuery, ...gastosParams);

    const ingresos =
      Number(ventasResult?.totalVentas || 0) +
      Number(reparacionesResult?.totalReparaciones || 0);
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
