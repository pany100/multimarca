import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    // Find all ventas with informacionCliente containing the query string
    // and that informacionCliente is not null
    const ventas = await prisma.venta.findMany({
      where: {
        informacionCliente: {
          contains: query,
          not: null,
        },
      },
      select: {
        id: true,
        informacionCliente: true,
        fecha: true,
      },
      orderBy: {
        fecha: "desc",
      },
      take: 10, // Limit to prevent too many results
    });

    // Extract unique informacionCliente values
    const uniqueInformacionClientes = Array.from(
      new Map(
        ventas.map((item) => [
          item.informacionCliente,
          {
            id: item.id,
            informacionCliente: item.informacionCliente,
            fecha: item.fecha,
          },
        ])
      ).values()
    );

    return NextResponse.json(uniqueInformacionClientes);
  } catch (error) {
    console.error("Error fetching informacionCliente:", error);
    return NextResponse.json(
      { error: "Error fetching informacionCliente" },
      { status: 500 }
    );
  }
}
