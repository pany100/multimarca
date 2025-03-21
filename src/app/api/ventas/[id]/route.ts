import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import {
  chequeQueryData,
  getChequeId,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { clienteId, items, moneda, total, fecha, tipoOperacion } = body;

    if (!validateChequeRequest(body, tipoOperacion)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!clienteId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos de venta inválidos o faltantes" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
        { status: 400 }
      );
    }

    // Obtener la venta actual para comparar items
    const ventaActual = await prisma.venta.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!ventaActual) {
      throw new Error("Venta no encontrada");
    }

    // Verificar solo los items nuevos o modificados
    for (const item of items) {
      const itemExistente = ventaActual.items.find(
        (i) => i.stockId === item.stockId && i.cantidad === item.cantidad
      );
      // Si el item ya existe con la misma cantidad, no necesita verificación
      if (itemExistente) {
        continue;
      }

      // Si es un item nuevo o modificado, verificar stock
      const stock = await prisma.stock.findUnique({
        where: { id: item.stockId },
        select: { id: true, name: true, units: true, restockValue: true },
      });

      const cantidadPrevia =
        ventaActual.items.find((i) => i.stockId === item.stockId)?.cantidad ||
        0;
      const cantidadAdicional = item.cantidad - cantidadPrevia;

      if (!stock || (stock.units ?? 0) - cantidadAdicional < 0) {
        throw new Error(`Stock insuficiente para el ítem ${stock?.name}`);
      }
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

    const chequeIdToPass = await getChequeId(body, tipoOperacion);

    const ventaActualizada = await prisma.$transaction(async (prisma) => {
      const stockVerification = new Map();
      for (const item of items) {
        const stock = await prisma.stock.findUnique({
          where: { id: item.stockId },
          select: { id: true, name: true, units: true },
        });
        if (!stock)
          throw new Error(`Stock no encontrado para el ítem ${item.stockId}`);
        stockVerification.set(item.stockId, stock.units ?? 0);
      }

      // Sumar las devoluciones
      for (const itemActual of ventaActual.items) {
        const stockActual = stockVerification.get(itemActual.stockId) ?? 0;
        stockVerification.set(
          itemActual.stockId,
          stockActual + itemActual.cantidad
        );
      }

      for (const item of items) {
        const stockDisponible = stockVerification.get(item.stockId) ?? 0;
        if (stockDisponible - item.cantidad < 0) {
          throw new Error(`Stock insuficiente para el ítem ${item.stockId}`);
        }
      }

      const ventaActualizada = await prisma.venta.update({
        where: { id },
        data: {
          clienteId,
          total,
          moneda,
          dolarId: dolar?.id,
          fecha,
          tipoOperacion,
          chequeId: chequeIdToPass,
          items: {
            deleteMany: {},
            create: items.map((item) => ({
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
          cheque: chequeQueryData,
        },
      });

      // Actualizar el stock en una sola operación por item
      for (const itemActual of ventaActual.items) {
        const itemNuevo = items.find(
          (item) => item.stockId === itemActual.stockId
        );
        const diferencia = (itemNuevo?.cantidad ?? 0) - itemActual.cantidad;

        await prisma.stock.update({
          where: { id: itemActual.stockId },
          data: {
            units: {
              decrement: diferencia,
            },
          },
        });
      }

      return ventaActualizada;
    });

    return NextResponse.json(returnModelWithChequeData(ventaActualizada));
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    return NextResponse.json(
      { error: `Error al actualizar la venta: ${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de venta inválido" },
        { status: 400 }
      );
    }

    const ventaEliminada = await prisma.$transaction(async (prisma) => {
      // Obtener la venta con sus items
      const venta = await prisma.venta.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      if (!venta) {
        throw new Error("Venta no encontrada");
      }

      // Restaurar el stock
      for (const item of venta.items) {
        const stockActualizado = await prisma.stock.update({
          where: { id: item.stockId },
          data: {
            units: {
              increment: item.cantidad,
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

      // Eliminar la venta
      return prisma.venta.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Venta eliminada correctamente",
      venta: ventaEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    return NextResponse.json(
      { error: "Error al eliminar la venta" },
      { status: 500 }
    );
  }
}
