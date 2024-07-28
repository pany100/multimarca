import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const meses = parseInt(searchParams.get("meses") || "3");
    const limite = parseInt(searchParams.get("limite") || "10");

    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const clientesGastos = await prisma.$queryRaw`
  WITH gastos_totales AS (
    SELECT 
      c.id AS clienteId,
      c.fullName AS nombreCliente,
      COALESCE(SUM(v.total), 0) + 
      COALESCE(SUM(
        orden.manoDeObra + 
        COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orden.id), 0) +
        COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.id IN (SELECT orrt.B FROM _OrdenReparacionReparacionTercero orrt WHERE orrt.A = orden.id)), 0)
      ), 0) AS gastoTotal,
      COALESCE(SUM(v.total / d.oficial), 0) +
      COALESCE(SUM(
        (orden.manoDeObra + 
        COALESCE((SELECT SUM(ru.precioVenta) FROM RepuestoUsado ru WHERE ru.ordenReparacionId = orden.id), 0) +
        COALESCE((SELECT SUM(rt.precioVenta) FROM ReparacionDeTercero rt WHERE rt.id IN (SELECT orrt.B FROM _OrdenReparacionReparacionTercero orrt WHERE orrt.A = orden.id)), 0)) / d.oficial
      ), 0) AS gastoTotalUSD
    FROM 
      Cliente c
      LEFT JOIN Venta v ON c.id = v.clienteId AND v.fecha >= ${fechaInicio}
      LEFT JOIN Auto a ON c.id = a.ownerId
      LEFT JOIN OrdenReparacion orden ON a.id = orden.autoId AND orden.fechaCreacion >= ${fechaInicio}
      LEFT JOIN Dolar d ON DATE(v.fecha) = d.fecha OR DATE(orden.fechaCreacion) = d.fecha
    GROUP BY 
      c.id, c.fullName
  )
  SELECT 
    clienteId,
    nombreCliente,
    gastoTotal,
    gastoTotalUSD
  FROM 
    gastos_totales
  ORDER BY 
    gastoTotal DESC
  LIMIT ${limite}
`;

    return NextResponse.json(clientesGastos);
  } catch (error) {
    console.error(
      "Error al obtener estadísticas de gastos de clientes:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
