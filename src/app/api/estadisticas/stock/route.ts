import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface StockRentable {
  id: number;
  name: string;
  brand: string;
  gananciaTotal: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");
    const limite = parseInt(url.searchParams.get("limite") || "5", 10);

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    let sqlQuery = `
      SELECT 
        s.id,
        s.name,
        s.brand,
        ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              (ru.unidadesConsumidas * ((ru.precioVenta + ru.precioVenta * (orep.porcentajeRecargo / 100)) - ru.precioCompra)) / COALESCE(d.blue, 1)
            ELSE 
              (ru.unidadesConsumidas * ((ru.precioVenta + ru.precioVenta * (orep.porcentajeRecargo / 100)) - ru.precioCompra))
          END
        ), 2) as gananciaTotal
      FROM Stock s
      JOIN RepuestoUsado ru ON s.id = ru.stockId
      JOIN OrdenReparacion orep ON ru.ordenReparacionId = orep.id
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      WHERE orep.estado != 'Presupuestado'
    `;

    const queryParams: any[] = [moneda];

    if (año && mes) {
      sqlQuery += ` AND orep.fechaCreacion >= ? AND orep.fechaCreacion < ?`;
      queryParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      sqlQuery += ` AND YEAR(orep.fechaCreacion) = ?`;
      queryParams.push(año);
    }

    sqlQuery += `
      GROUP BY s.id, s.name, s.brand
      ORDER BY gananciaTotal DESC
      LIMIT ?
    `;
    queryParams.push(limite);

    const stocksRentables = await prisma.$queryRawUnsafe<StockRentable[]>(
      sqlQuery,
      ...queryParams
    );

    const stocksFormateados = stocksRentables.map((stock) => ({
      id: stock.id,
      nombre: stock.name,
      marca: stock.brand,
      gananciaTotal: parseFloat(stock.gananciaTotal.toString()),
    }));

    return NextResponse.json(stocksFormateados);
  } catch (error) {
    console.error("Error al obtener estadísticas de stock:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
