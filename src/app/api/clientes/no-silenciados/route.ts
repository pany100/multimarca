import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const [clientesNoSilenciados, total] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          can_receive_notifications: true,
          OR: [
            { fullName: { contains: query } },
            { email: { contains: query } },
            { dni: { contains: query } },
          ],
        },
        skip,
        take: size,
        orderBy: { fullName: "asc" },
      }),
      prisma.cliente.count({
        where: {
          can_receive_notifications: true,
          OR: [
            { fullName: { contains: query } },
            { email: { contains: query } },
            { dni: { contains: query } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      items: clientesNoSilenciados,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener clientes no silenciados:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes no silenciados" },
      { status: 500 }
    );
  }
}
