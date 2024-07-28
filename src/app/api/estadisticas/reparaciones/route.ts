import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface ClienteDetallado {
  id: number;
  fullName: string;
  totalGastos: number;
}

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la solicitud
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";
    const mes = url.searchParams.get("mes");
    const año = url.searchParams.get("año");
    const limite = parseInt(url.searchParams.get("limite") || "5", 10);

    // Validar la moneda
    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    // Construir la consulta SQL base
    let sqlQuery = `
      SELECT 
        c.id, 
        c.fullName, 
        ROUND(SUM(CASE 
          WHEN ? = 'USD' THEN (
            or.manoDeObra + 
            COALESCE(SUM(ru.precioVenta), 0) + 
            COALESCE(SUM(rt.precioVenta), 0)
          ) / COALESCE(
            (SELECT d.blue 
             FROM Dolar d 
             WHERE DATE(d.fecha) <= DATE(or.fechaCreacion) 
             ORDER BY d.fecha DESC 
             LIMIT 1), 
            1)
          ELSE (
            or.manoDeObra + 
            COALESCE(SUM(ru.precioVenta), 0) + 
            COALESCE(SUM(rt.precioVenta), 0)
          )
        END)) as totalGastos
      FROM Cliente c
      JOIN Auto a ON c.id = a.ownerId
      JOIN OrdenReparacion or ON a.id = or.autoId
      LEFT JOIN RepuestoUsado ru ON or.id = ru.ordenReparacionId
      LEFT JOIN ReparacionDeTercero rt ON or.id = rt.ordenReparacionId
      LEFT JOIN Dolar d ON DATE(or.fechaCreacion) = DATE(d.fecha)
      WHERE or.estado != 'Presupuestado'
    `;

    const queryParams: any[] = [moneda];

    // Aplicar filtros de fecha si es necesario
    if (año && mes) {
      sqlQuery += ` AND or.fechaCreacion >= ? AND or.fechaCreacion < ?`;
      queryParams.push(`${año}-${mes}-01`, `${año}-${parseInt(mes) + 1}-01`);
    } else if (año) {
      sqlQuery += ` AND YEAR(or.fechaCreacion) = ?`;
      queryParams.push(año);
    }

    // Agrupar y ordenar resultados
    sqlQuery += `
      GROUP BY c.id, c.fullName
      ORDER BY totalGastos DESC
      LIMIT ?
    `;
    queryParams.push(limite);

    console.log("Consulta SQL:", sqlQuery);
    console.log("Parámetros:", queryParams);

    const clientesDetallados = await prisma.$queryRawUnsafe<ClienteDetallado[]>(
      sqlQuery,
      ...queryParams
    );

    const clientesFormateados = clientesDetallados.map((cliente: any) => ({
      id: cliente.id,
      fullName: cliente.fullName,
      totalGastos: parseInt(cliente.totalGastos),
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
