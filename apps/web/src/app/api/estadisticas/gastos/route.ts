import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface CategoriaGastoDetallado {
  id: number;
  nombre: string;
  totalGastos: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");
    const limit = url.searchParams.get("limit") || "10";

    // Auth: necesitamos rol del usuario para filtrar categorías con roles
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const user = await prisma.usuario.findUnique({
      where: { id: decodedToken.userId },
      include: { rol: true },
    });
    if (!user?.rol) {
      return NextResponse.json(
        { error: "Usuario no tiene rol asignado" },
        { status: 403 }
      );
    }

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    let sqlQuery = `
    SELECT 
      cg.id, 
      cg.nombre, 
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
    FROM CategoriaGasto cg
    JOIN Gasto g ON cg.id = g.categoriaId
    WHERE 1=1
    AND (
      NOT EXISTS (
        SELECT 1 FROM \`_CategoriaGastoToRol\` cgr WHERE cgr.A = cg.id
      )
      OR EXISTS (
        SELECT 1 FROM \`_CategoriaGastoToRol\` cgr WHERE cgr.A = cg.id AND cgr.B = ?
      )
    )
    `;

    const queryParams: any[] = [moneda, user.rol.id];

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
      GROUP BY cg.id, cg.nombre
      ORDER BY totalGastos DESC
      LIMIT ?
    `;
    queryParams.push(parseInt(limit));

    const categoriasGastoDetallado = await prisma.$queryRawUnsafe<
      CategoriaGastoDetallado[]
    >(sqlQuery, ...queryParams);

    if (categoriasGastoDetallado.length === 0) {
      return NextResponse.json({
        message: "No se encontraron datos para el período especificado",
      });
    }

    const categoriasFormateadas = categoriasGastoDetallado.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      totalGastos: parseFloat(categoria.totalGastos.toFixed(2)),
    }));

    return NextResponse.json(categoriasFormateadas);
  } catch (error) {
    console.error("Error al obtener estadísticas de gastos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
