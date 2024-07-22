import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query") || "";

    const where: Prisma.VentaWhereInput = {
      OR: [
        { cliente: { fullName: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
      ],
    };

    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where,
        include: {
          cliente: true,
          items: {
            include: {
              stock: true,
            },
          },
        },
        skip: page * limit,
        take: limit,
        orderBy: { fecha: "desc" },
      }),
      prisma.venta.count({ where }),
    ]);

    return NextResponse.json({
      items: ventas,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, items, total } = body;

    const venta = await prisma.venta.create({
      data: {
        clienteId,
        total,
        items: {
          create: items.map((item: { stockId: number; cantidad: number }) => ({
            stockId: item.stockId,
            cantidad: item.cantidad,
          })),
        },
      },
      include: {
        cliente: true,
        items: {
          include: {
            stock: true,
          },
        },
      },
    });

    // Actualizar el stock
    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { id: item.stockId },
        select: { units: true },
      });

      if (!stock || (stock.units ?? 0) - item.cantidad < 0) {
        throw new Error(
          `Stock insuficiente para el ítem con ID ${item.stockId}`
        );
      }

      await prisma.stock.update({
        where: { id: item.stockId },
        data: {
          units: {
            decrement: item.cantidad,
          },
        },
      });
    }

    return NextResponse.json(venta);
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
