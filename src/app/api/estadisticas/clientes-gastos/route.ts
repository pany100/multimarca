import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const clientesConGastos = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.fullName AS nombreCliente,
        SUM(v.total) AS gastoTotalARS,
        ROUND(
          SUM(v.total) / (
            SELECT d.oficial 
            FROM Dolar d 
            WHERE d.fecha <= v.fecha 
            ORDER BY d.fecha DESC 
            LIMIT 1
          ), 2
        ) AS gastoTotalUSD
      FROM 
        Cliente c
      LEFT JOIN 
        Venta v ON c.id = v.clienteId
      GROUP BY 
        c.id, c.fullName
      ORDER BY 
        COUNT(v.id) DESC,
        SUM(v.total) DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(clientesConGastos);
  } catch (error) {
    console.error("Error al obtener los clientes con más gastos:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
