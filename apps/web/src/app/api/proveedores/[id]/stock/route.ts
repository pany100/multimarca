import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proveedorId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause = {
      AND: [
        { proveedorId: proveedorId },
        {
          OR: [
            { name: { contains: query } },
            { brand: { contains: query } },
            { label: { contains: query } },
          ],
        },
      ],
    };

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.stock.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: stocks,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener stock del proveedor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
