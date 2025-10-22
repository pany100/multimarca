import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface GastoMecanico {
  id: number;
  name: string;
  totalGastos: number;
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

    let sqlQuery = `
    SELECT 
    e.id,
    e.name,
      ROUND(SUM(
        CASE 
          WHEN ? = 'USD' THEN 
            CASE
              WHEN g.moneda = 'Dolar' THEN g.precio + g.gastosBancarios
              ELSE (g.precio + g.gastosBancarios) / COALESCE(g.cotizacionDolar, 1)
            END
        ELSE 
          CASE
            WHEN g.moneda = 'Dolar' THEN (g.precio + g.gastosBancarios) * COALESCE(g.cotizacionDolar, 1)
            ELSE (g.precio + g.gastosBancarios)
          END
        END
      ), 2) as totalGastos
      FROM Gasto g
      JOIN Empleado e ON e.id = g.mecanicoId
    JOIN CategoriaGasto cg ON g.categoriaId = cg.id
    WHERE cg.id = 2
    `;

    const queryParams: any[] = [moneda];
    if (año && mes) {
      sqlQuery += ` AND g.fecha >= ? AND g.fecha < ?`;
      queryParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      sqlQuery += ` AND YEAR(g.fecha) = ?`;
      queryParams.push(año);
    }

    sqlQuery += `
    GROUP BY e.id, e.name
    ORDER BY totalGastos DESC;
    `;

    const gastosMecanicos = await prisma.$queryRawUnsafe<GastoMecanico[]>(
      sqlQuery,
      ...queryParams
    );

    if (gastosMecanicos.length === 0) {
      return NextResponse.json({
        message: "No se encontraron datos para el período especificado",
      });
    }

    const mecanicosFormateados = gastosMecanicos.map((mecanico) => ({
      id: mecanico.id,
      fullName: mecanico.name,
      totalGastos: parseFloat(mecanico.totalGastos.toFixed(2)),
    }));

    return NextResponse.json(mecanicosFormateados);
  } catch (error) {
    console.error(
      "Error al obtener estadísticas de gastos por mecánico:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
