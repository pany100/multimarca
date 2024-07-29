import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface MarcaAuto {
  marca: string;
  cantidad: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const año = url.searchParams.get("año");
    const mes = url.searchParams.get("mes");
    const limite = parseInt(url.searchParams.get("limite") || "5", 10);

    let sqlQuery = `
      SELECT 
        a.brand as marca, 
        COUNT(DISTINCT orep.id) as cantidad
      FROM Auto a
      JOIN OrdenReparacion orep ON a.id = orep.autoId
      WHERE 1=1
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
      GROUP BY a.brand
      ORDER BY cantidad DESC
      LIMIT ?
    `;
    queryParams.push(limite);

    const marcasAtendidas = await prisma.$queryRawUnsafe<MarcaAuto[]>(
      sqlQuery,
      ...queryParams
    );

    const marcasFormateadas = marcasAtendidas.map((marca) => ({
      marca: marca.marca,
      cantidad: Number(marca.cantidad),
    }));

    return NextResponse.json(marcasFormateadas);
  } catch (error) {
    console.error("Error al obtener estadísticas de autos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
