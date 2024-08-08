import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const needsRestock = searchParams.get("needsRestock") === "true";

    const skip = page * size;

    let whereClause: any = {
      OR: [
        { name: { contains: query } },
        { brand: { contains: query } },
        { label: { contains: query } },
      ],
    };

    if (needsRestock) {
      whereClause = {
        AND: [
          whereClause,
          {
            OR: [
              { units: { lte: prisma.stock.fields.restockValue } },
              { units: null },
            ],
          },
        ],
      };
    }

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { name: "asc" },
        include: { proveedor: true },
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
    console.error("Error al obtener stock:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, buyPrice, restockValue, label, markup, proveedorId } =
      body;

    if (
      !name ||
      typeof name !== "string" ||
      !brand ||
      typeof brand !== "string"
    ) {
      return NextResponse.json(
        { error: "Nombre o marca del stock inválido o faltante" },
        { status: 400 }
      );
    }

    const nuevoStock = await prisma.stock.create({
      data: {
        name,
        brand,
        buyPrice,
        units: 0,
        restockValue: restockValue ? parseInt(restockValue, 10) : null,
        label,
        markup: markup ? parseFloat(markup) : null,
        proveedorId,
      },
      include: {
        proveedor: true,
      },
    });

    return NextResponse.json(nuevoStock, { status: 201 });
  } catch (error) {
    console.error("Error al crear stock:", error);
    return NextResponse.json(
      { error: "No se pudo crear el stock" },
      { status: 500 }
    );
  }
}
