import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { Prisma, TipoNotificacionInterna } from "@prisma/client";
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
    const { clienteId, items, total, fecha } = body;

    const venta = await prisma.venta.create({
      data: {
        clienteId,
        total,
        fecha,
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

    // Actualizar el stock y crear notificaciones si es necesario
    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { id: item.stockId },
        select: { id: true, name: true, units: true, restockValue: true },
      });

      if (!stock || (stock.units ?? 0) - item.cantidad < 0) {
        throw new Error(`Stock insuficiente para el ítem ${stock?.name}`);
      }

      const stockActualizado = await prisma.stock.update({
        where: { id: item.stockId },
        data: {
          units: {
            decrement: item.cantidad,
          },
        },
      });

      if (
        (stockActualizado.units ?? 0) <= (stockActualizado.restockValue ?? 0)
      ) {
        await prisma.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `${stockActualizado.name} necesita reposición`,
            texto: `El elemento ${stockActualizado.name} quedó con ${stockActualizado.units} unidades. Necesita reponer stock.`,
            leida: false,
            tipo: TipoNotificacionInterna.REPOSICION_STOCK,
            stockId: stockActualizado.id,
          },
        });
        const io = getIO();
        if (io) {
          io.emit("newNotification");
        }
      }
    }

    return NextResponse.json(venta);
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: `Error al crear venta: ${error}` },
      { status: 500 }
    );
  }
}
