import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface UsuarioExtraccion {
  id: number;
  fullName: string;
  totalExtracciones: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");

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
          WHEN ? = 'USD' THEN 
            CASE
              WHEN e.moneda = 'Dolar' THEN e.monto
              ELSE e.monto / COALESCE(e.cotizacionDolar, 1)
            END
          ELSE 
            CASE
              WHEN e.moneda = 'Dolar' THEN e.monto * COALESCE(e.cotizacionDolar, 1)
              ELSE e.monto
            END
        END)) as totalExtracciones
      FROM Usuario u
      LEFT JOIN Extraccion e ON u.id = e.usuarioId
      WHERE 1=1
    `;

    const queryParams: any[] = [moneda];

    if (año && mes) {
      sqlQuery += ` AND e.fecha >= ? AND e.fecha < ?`;
      queryParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      sqlQuery += ` AND YEAR(e.fecha) = ?`;
      queryParams.push(año);
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

    const usuariosFormateados = usuariosExtracciones
      .filter((usuario) => usuario.totalExtracciones !== null)
      .map((usuario) => ({
        ...usuario,
        totalExtracciones:
          parseFloat(usuario.totalExtracciones.toString()) || 0,
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
