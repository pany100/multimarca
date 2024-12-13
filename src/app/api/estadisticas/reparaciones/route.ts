import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface ClienteDetallado {
  id: number;
  fullName: string;
  totalGastos: number;
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
        c.id, 
        c.fullName, 
        ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              (orep.manoDeObra + 
               COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.ordenReparacionId = orep.id), 0)
              ) / COALESCE(d.blue, 1)
            ELSE 
              (orep.manoDeObra + 
               COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orep.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.ordenReparacionId = orep.id), 0)
              )
          END
        )) as totalGastos,
        COUNT(DISTINCT orep.id) as cantidadOrdenes
    FROM Cliente c
    JOIN Auto a ON c.id = a.ownerId
    JOIN OrdenReparacion orep ON a.id = orep.autoId
    LEFT JOIN Dolar d ON d.id = orep.dolarId
    WHERE orep.estado != 'Presupuestado'
`;

    const queryParams: any[] = [moneda];

    if (año && mes) {
      sqlQuery += ` AND orep.fechaCreacion >= ? AND orep.fechaCreacion < ?`;
      queryParams.push(`${año}-${mes}-01`, `${año}-${parseInt(mes) + 1}-01`);
    } else if (año) {
      sqlQuery += ` AND YEAR(orep.fechaCreacion) = ?`;
      queryParams.push(año);
    }

    sqlQuery += `
      GROUP BY c.id, c.fullName
      ORDER BY totalGastos DESC
      LIMIT ?
    `;
    queryParams.push(limite);

    const clientesDetallados = await prisma.$queryRawUnsafe<ClienteDetallado[]>(
      sqlQuery,
      ...queryParams
    );

    const clientesFormateados = clientesDetallados.map((cliente) => ({
      id: cliente.id,
      fullName: cliente.fullName,
      totalGastos: parseFloat(cliente.totalGastos.toFixed(2)),
    }));

    return NextResponse.json(clientesFormateados);
  } catch (error) {
    console.error("Error al obtener estadísticas de reparaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
