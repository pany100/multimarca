import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { TipoNotificacionInterna } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { clienteId, items, total, fecha } = body;

    if (!clienteId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos de venta inválidos o faltantes" },
        { status: 400 }
      );
    }

    const ventaActualizada = await prisma.$transaction(async (prisma) => {
      // Obtener la venta actual
      const ventaActual = await prisma.venta.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      if (!ventaActual) {
        throw new Error("Venta no encontrada");
      }

      // Restaurar el stock de los elementos eliminados o modificados
      for (const itemActual of ventaActual.items) {
        const itemNuevo = items.find((item) => item.id === itemActual.id);
        const cantidadARestaurar = itemNuevo
          ? itemActual.cantidad - itemNuevo.cantidad
          : itemActual.cantidad;

        if (cantidadARestaurar !== 0) {
          await prisma.stock.update({
            where: { id: itemActual.stockId },
            data: {
              units: {
                increment: cantidadARestaurar,
              },
            },
          });
        }
      }

      // Actualizar la venta
      const ventaActualizada = await prisma.venta.update({
        where: { id },
        data: {
          clienteId,
          total,
          fecha,
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
        },
      });

      // Actualizar el stock de los nuevos elementos
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

      return ventaActualizada;
    });

    return NextResponse.json(ventaActualizada);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    return NextResponse.json(
      {
        error: `Error al actualizar la venta: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
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
