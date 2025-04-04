import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import {
  chequeQueryData,
  getChequeIdAndValidate,
  returnAllModelsWithChequeData,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { Prisma, TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query") || "";
    const presupuestoInput = searchParams.get("presupuesto");
    let presupuesto = undefined;
    if (presupuestoInput === "true") {
      presupuesto = true;
    } else if (presupuestoInput === "false") {
      presupuesto = false;
    }
    const where: Prisma.VentaWhereInput = {
      OR: [
        { cliente: { fullName: { contains: query } } },
        { id: { equals: parseInt(query) || undefined } },
      ],
      presupuesto,
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
          cheque: chequeQueryData,
        },
        skip: page * limit,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.venta.count({ where }),
    ]);
    const ventasConItems = ventas.map((venta) => ({
      ...venta,
      items: venta.items.map((item) => ({
        ...item,
        name: item.stock.name,
        stockId: item.stock.id,
      })),
    }));

    return NextResponse.json({
      items: returnAllModelsWithChequeData(ventasConItems),
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
    const {
      clienteId,
      items,
      total,
      moneda,
      fecha,
      tipoOperacion,
      presupuesto,
    } = body;

    if (!validateChequeRequest(body, tipoOperacion)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    // Verificar stock suficiente antes de crear la venta
    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { id: item.stockId },
        select: { id: true, name: true, units: true, restockValue: true },
      });

      if (!stock || (stock.units ?? 0) - item.cantidad < 0) {
        throw new Error(`Stock insuficiente para el ítem ${stock?.name}`);
      }
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
        { status: 400 }
      );
    }

    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: new Date(fecha),
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacion);
    } catch (error) {
      return NextResponse.json(
        { error: "Error al obtener el ID del cheque" },
        { status: 400 }
      );
    }

    const venta = await prisma.venta.create({
      data: {
        clienteId,
        total,
        fecha,
        moneda,
        dolarId: dolar?.id,
        items: {
          create: items.map((item: { stockId: number; cantidad: number }) => ({
            stockId: item.stockId,
            cantidad: item.cantidad,
          })),
        },
        tipoOperacion,
        chequeId: chequeIdToPass,
        presupuesto,
      },
      include: {
        cliente: true,
        items: {
          include: {
            stock: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    // Actualizar el stock y crear notificaciones si es necesario
    for (const item of items) {
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
    const ventaToReturn = {
      ...venta,
      items: venta.items.map((item) => ({
        ...item,
        name: item.stock.name,
        stockId: item.stock.id,
      })),
    };

    return NextResponse.json(returnModelWithChequeData(ventaToReturn), {
      status: 201,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: `Error al crear la venta: ${error}` },
      { status: 500 }
    );
  }
}
