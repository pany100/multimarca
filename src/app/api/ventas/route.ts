import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import {
  OperacionCheque,
  Prisma,
  TipoNotificacionInterna,
  TipoOperacion,
} from "@prisma/client";
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
        orderBy: { id: "desc" },
      }),
      prisma.venta.count({ where }),
    ]);

    const ventasConCheques = await Promise.all(
      ventas.map(async (venta) => {
        if (venta.tipoOperacion === "CHEQUE") {
          const cheque = await prisma.cheque.findFirst({
            where: {
              operacionCheque: OperacionCheque.VENTA,
              operacionId: venta.id,
            },
          });
          return {
            ...venta,
            cheque,
          };
        }
        return venta;
      })
    );

    return NextResponse.json({
      items: ventasConCheques,
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
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      monto,
      numeroCheque,
      picturePath,
    } = body;

    if (tipoOperacion === TipoOperacion.CHEQUE) {
      if (
        !banco ||
        !emisor ||
        !fechaCobro ||
        !fechaEmision ||
        !monto ||
        !numeroCheque ||
        !picturePath
      ) {
        return NextResponse.json(
          { error: "Faltan datos para la operación de cheque" },
          { status: 400 }
        );
      }
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

    const cheque = await prisma.cheque.create({
      data: {
        banco,
        owner: emisor,
        fechaCobro,
        fechaEmision,
        monto,
        numero: numeroCheque,
        operacionCheque: OperacionCheque.VENTA,
        operacionId: venta.id,
        picturePath,
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
      cheque: cheque,
    };

    return NextResponse.json(ventaToReturn);
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { error: `Error al crear venta: ${error}` },
      { status: 500 }
    );
  }
}
