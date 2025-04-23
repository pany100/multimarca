import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface ClienteDetallado {
  id: number;
  fullName: string;
  totalVentas: number;
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
        c.id as clienteId,
        c.fullName as clienteName,
        ROUND(SUM(
          CASE 
            WHEN ? = 'USD' THEN 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.ventaId = v.id), 0) + 
               COALESCE(v.incremento, 0) - 
               COALESCE(v.descuento, 0)
              ) / COALESCE(d.blue, 1)
            ELSE 
              (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ventaId = v.id), 0) + 
               COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.ventaId = v.id), 0) + 
               COALESCE(v.incremento, 0) - 
               COALESCE(v.descuento, 0)
              )
          END
        )) as totalVentas
      FROM Cliente c
      LEFT JOIN Venta v ON c.id = v.clienteId
      LEFT JOIN Dolar d ON d.fecha = DATE(v.fecha)
      WHERE v.presupuesto = false
    `;

    const queryParams: any[] = [moneda];

    // Aplicar filtros de fecha si es necesario
    if (año && mes) {
      sqlQuery += ` AND v.fecha >= ? AND v.fecha < ?`;
      queryParams.push(
        `${año}-${mes}-01`,
        mes === "12"
          ? `${parseInt(año) + 1}-01-01`
          : `${año}-${parseInt(mes) + 1}-01`
      );
    } else if (año) {
      sqlQuery += ` AND YEAR(v.fecha) = ?`;
      queryParams.push(año);
    }

    // Agrupar y ordenar resultados
    sqlQuery += `
      GROUP BY c.id, c.fullName
      ORDER BY totalVentas DESC
      LIMIT ?
    `;
    queryParams.push(limite);

    const clientesDetallados = await prisma.$queryRawUnsafe<ClienteDetallado[]>(
      sqlQuery,
      ...queryParams
    );

    const clientesFormateados = clientesDetallados.map((cliente: any) => ({
      id: cliente.clienteId,
      fullName: cliente.clienteName,
      totalVentas: parseInt(cliente.totalVentas),
    }));

    return NextResponse.json(clientesFormateados);
  } catch (error) {
    console.error("Error al obtener estadísticas de ventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
