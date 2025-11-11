import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    let whereClause = {};
    if (query) {
      whereClause = {
        OR: [
          { name: { contains: query } },
          { id: { equals: parseInt(query || "") || undefined } },
        ],
      };
    }

    const [trabajos, total] = await Promise.all([
      prisma.manoDeObra.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.manoDeObra.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: trabajos,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener trabajos de mano de obra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sellPrice } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de trabajo inválido o faltante" },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(sellPrice))) {
      return NextResponse.json(
        { error: "Precio de venta inválido" },
        { status: 400 }
      );
    }

    const sellPriceNumber = parseFloat(sellPrice);

    const nuevoTrabajo = await prisma.manoDeObra.create({
      data: {
        name,
        sellPrice: sellPriceNumber,
      },
    });

    return NextResponse.json(nuevoTrabajo, { status: 201 });
  } catch (error) {
    console.error("Error al crear trabajo de mano de obra:", error);
    return NextResponse.json(
      { error: "No se pudo crear el trabajo de mano de obra" },
      { status: 500 }
    );
  }
}
