import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface UsuarioExtraccion {
  id: number;
  fullName: string;
  totalExtracciones: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const fechaInicio = url.searchParams.get("fechaInicio");
    const fechaFin = url.searchParams.get("fechaFin");
    const limit = url.searchParams.get("limit") || "10";

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    let sqlQuery = `
      SELECT 
        u.id, 
        u.fullName, 
        ROUND(SUM(CASE 
          WHEN ? = 'USD' THEN e.monto / COALESCE(
            (SELECT d.blue 
             FROM Dolar d 
             WHERE DATE(d.fecha) <= DATE(e.fecha) 
             ORDER BY d.fecha DESC 
             LIMIT 1), 
            1)
          ELSE e.monto 
        END)) as totalExtracciones
      FROM Usuario u
      LEFT JOIN Extraccion e ON u.id = e.usuarioId
      LEFT JOIN Dolar d ON DATE(e.fecha) = DATE(d.fecha)
      WHERE 1=1
    `;

    const queryParams: any[] = [moneda];

    if (fechaInicio && fechaFin) {
      sqlQuery += ` AND e.fecha >= ? AND e.fecha <= ?`;
      queryParams.push(fechaInicio, fechaFin);
    }

    sqlQuery += `
      GROUP BY u.id, u.fullName
      ORDER BY totalExtracciones DESC
      LIMIT ?
      `;
    queryParams.push(parseInt(limit));

    const usuariosExtracciones = await prisma.$queryRawUnsafe<
      UsuarioExtraccion[]
    >(sqlQuery, ...queryParams);

    const usuariosFormateados = usuariosExtracciones.map((usuario: any) => ({
      id: usuario.id,
      fullName: usuario.fullName,
      totalExtracciones: parseFloat(usuario.totalExtracciones),
    }));

    return NextResponse.json(usuariosFormateados);
  } catch (error) {
    console.error("Error al obtener estadísticas de extracciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
