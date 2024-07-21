import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";

    const skip = page * size;

    const whereClause = {
      OR: [
        { proveedor: { name: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    const [ordenesDeCompra, total] = await Promise.all([
      prisma.ordenDeCompra.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
        include: {
          proveedor: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
      }),
      prisma.ordenDeCompra.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      items: ordenesDeCompra,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, precioTotal, proveedorId, items } = body;

    if (!fecha || !proveedorId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos de orden de compra inválidos o faltantes" },
        { status: 400 }
      );
    }

    const nuevaOrdenDeCompra = await prisma.$transaction(async (prisma) => {
      const ordenCreada = await prisma.ordenDeCompra.create({
        data: {
          fecha: fecha ? new Date(fecha) : new Date(),
          proveedorId,
          precioTotal,
          items: {
            create: items.map((item) => ({
              cantidad: item.cantidad,
              stockId: item.stockId,
            })),
          },
        },
        include: {
          proveedor: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      for (const item of items) {
        await prisma.stock.update({
          where: { id: item.stockId },
          data: {
            units: {
              increment: item.cantidad,
            },
          },
        });
      }

      return ordenCreada;
    });

    return NextResponse.json(nuevaOrdenDeCompra, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden de compra:", error);
    return NextResponse.json(
      { error: "No se pudo crear la orden de compra" },
      { status: 500 }
    );
  }
}
