import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const needsRestock = searchParams.get("needsRestock") === "true";
    const proveedorId = searchParams.get("proveedorId")
      ? parseInt(searchParams.get("proveedorId")!)
      : null;

    const skip = page * size;

    let whereClause: any = {
      OR: [
        { id: { equals: parseInt(query) || undefined } },
        { name: { contains: query } },
        { brand: { contains: query } },
        { label: { contains: query } },
        { reportName: { contains: query } },
        { sector: { contains: query } },
        { carBrand: { contains: query } },
      ],
    };

    if (proveedorId) {
      whereClause = { AND: [whereClause, { proveedorId }] };
    }

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
        orderBy: { id: "desc" },
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
    const {
      name,
      brand,
      buyPrice,
      restockValue,
      label,
      markup,
      proveedorId,
      reportName,
      sector,
      carBrand,
      fraccionable,
    } = body;

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
        reportName: reportName || null,
        sector: sector || null,
        carBrand: carBrand || null,
        fraccionable: Boolean(fraccionable),
      } as any,
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
