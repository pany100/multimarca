import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface StockRentable {
  id: number;
  name: string;
  brand: string;
  gananciaTotal: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");
    const limite = parseInt(url.searchParams.get("limite") || "5", 10);

    let sqlQuery = `
      SELECT 
        s.id,
        s.name,
        s.brand,
        ROUND(SUM(ru.unidadesConsumidas * (ru.precioVenta - ru.precioCompra)), 2) as gananciaTotal
      FROM Stock s
      JOIN RepuestoUsado ru ON s.id = ru.stockId
      JOIN OrdenReparacion orep ON ru.ordenReparacionId = orep.id
      WHERE orep.estado != 'Presupuestado'
    `;

    const queryParams: any[] = [];

    if (año && mes) {
      sqlQuery += ` AND orep.fechaCreacion >= ? AND orep.fechaCreacion < ?`;
      queryParams.push(`${año}-${mes}-01`, `${año}-${parseInt(mes) + 1}-01`);
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
