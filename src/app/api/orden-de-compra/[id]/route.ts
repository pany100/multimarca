import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { fecha, precioTotal, proveedorId, items } = body;

    if (!proveedorId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos de orden de compra inválidos o faltantes" },
        { status: 400 }
      );
    }

    const ordenDeCompraActualizada = await prisma.$transaction(
      async (prisma) => {
        // Obtener la orden de compra actual
        const ordenActual = await prisma.ordenDeCompra.findUnique({
          where: { id },
          include: {
            items: {
              include: {
                stock: true,
              },
            },
          },
        });

        if (!ordenActual) {
          throw new Error("Orden de compra no encontrada");
        }

        // Restaurar el stock de los elementos eliminados
        for (const itemActual of ordenActual.items) {
          const itemNuevo = items.find((item) => item.id === itemActual.id);
          if (!itemNuevo) {
            const stockActualizado = await prisma.stock.update({
              where: { id: itemActual.stockId },
              data: {
                units: {
                  decrement: itemActual.cantidad,
                },
              },
            });

            if (stockActualizado.units !== null && stockActualizado.units < 0) {
              throw new Error(
                `Stock insuficiente para el ítem ${itemActual.stock.name}`
              );
            }
          }
        }

        // Actualizar la orden de compra
        const ordenActualizada = await prisma.ordenDeCompra.update({
          where: { id },
          data: {
            fecha: fecha ? new Date(fecha) : new Date(),
            proveedorId,
            precioTotal,
            items: {
              deleteMany: {},
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

        // Actualizar el stock de los nuevos elementos
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

        return ordenActualizada;
      }
    );

    return NextResponse.json(ordenDeCompraActualizada);
  } catch (error) {
    console.error("Error al actualizar orden de compra:", error);
    return NextResponse.json(
      { error: "Error al actualizar la orden de compra" },
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
        { error: "ID de orden de compra inválido" },
        { status: 400 }
      );
    }

    const ordenEliminada = await prisma.$transaction(async (prisma) => {
      // Obtener la orden de compra con sus items
      const orden = await prisma.ordenDeCompra.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              stock: true,
            },
          },
        },
      });

      if (!orden) {
        throw new Error("Orden de compra no encontrada");
      }

      // Restaurar el stock
      for (const item of orden.items) {
        await prisma.stock.update({
          where: { id: item.stockId },
          data: {
            units: {
              decrement: item.cantidad,
            },
          },
        });
      }

      // Eliminar la orden de compra
      return prisma.ordenDeCompra.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Orden de compra eliminada correctamente",
      orden: ordenEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar orden de compra:", error);
    return NextResponse.json(
      { error: "Error al eliminar la orden de compra" },
      { status: 500 }
    );
  }
}
