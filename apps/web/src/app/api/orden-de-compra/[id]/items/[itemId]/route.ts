import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

async function recalcularPrecioTotal(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  ordenDeCompraId: number,
) {
  const items = await tx.ordenDeCompraItem.findMany({
    where: { ordenDeCompraId },
  });
  const precioTotal = items.reduce((total, item) => {
    const precio = Number(item.precioUnitario) || 0;
    const iva = Number(item.iva) || 0;
    return total + precio * (1 + iva / 100) * item.cantidad;
  }, 0);
  await tx.ordenDeCompra.update({
    where: { id: ordenDeCompraId },
    data: { precioTotal },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  try {
    const ordenDeCompraId = parseInt(params.id);
    const itemId = parseInt(params.itemId);

    if (isNaN(ordenDeCompraId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: "IDs inválidos" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { stockId, cantidad, precioUnitario, iva } = body;

    const result = await prisma.$transaction(async (tx) => {
      const itemActual = await tx.ordenDeCompraItem.findFirst({
        where: { id: itemId, ordenDeCompraId },
      });

      if (!itemActual) {
        throw new Error("Item no encontrado");
      }

      // Si cambió el stockId, revertir stock viejo e incrementar nuevo
      if (stockId !== undefined && stockId !== itemActual.stockId) {
        const cantidadActual = cantidad ?? itemActual.cantidad;
        // Decrementar stock anterior
        await tx.stock.update({
          where: { id: itemActual.stockId },
          data: { units: { decrement: itemActual.cantidad } },
        });
        // Incrementar stock nuevo
        const nuevoStock = await tx.stock.findUnique({
          where: { id: stockId },
          select: { units: true },
        });
        await tx.stock.update({
          where: { id: stockId },
          data: {
            units:
              nuevoStock?.units === null
                ? cantidadActual
                : { increment: cantidadActual },
          },
        });
      } else if (cantidad !== undefined && cantidad !== itemActual.cantidad) {
        // Solo cambió la cantidad, ajustar stock actual
        const diferencia = cantidad - itemActual.cantidad;
        await tx.stock.update({
          where: { id: itemActual.stockId },
          data: { units: { increment: diferencia } },
        });
      }

      const data: any = {};
      if (stockId !== undefined) data.stockId = stockId;
      if (cantidad !== undefined) data.cantidad = cantidad;
      if (precioUnitario !== undefined)
        data.precioUnitario = precioUnitario ?? null;
      if (iva !== undefined) data.iva = iva ?? null;

      const itemActualizado = await tx.ordenDeCompraItem.update({
        where: { id: itemId },
        data,
        include: { stock: true },
      });

      await recalcularPrecioTotal(tx, ordenDeCompraId);

      return itemActualizado;
    });

    const itemConLabel = {
      ...result,
      name: result.stock.name,
      label: result.stock.label,
    };

    return NextResponse.json(itemConLabel);
  } catch (error: any) {
    console.error("Error al actualizar item:", error);
    if (error.message === "Item no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error al actualizar el item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  try {
    const ordenDeCompraId = parseInt(params.id);
    const itemId = parseInt(params.itemId);

    if (isNaN(ordenDeCompraId) || isNaN(itemId)) {
      return NextResponse.json(
        { error: "IDs inválidos" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const item = await tx.ordenDeCompraItem.findFirst({
        where: { id: itemId, ordenDeCompraId },
      });

      if (!item) {
        throw new Error("Item no encontrado");
      }

      // Decrementar stock
      await tx.stock.update({
        where: { id: item.stockId },
        data: { units: { decrement: item.cantidad } },
      });

      // Eliminar item
      await tx.ordenDeCompraItem.delete({ where: { id: itemId } });

      // Recalcular precioTotal
      await recalcularPrecioTotal(tx, ordenDeCompraId);
    });

    return NextResponse.json({ message: "Item eliminado correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar item:", error);
    if (error.message === "Item no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error al eliminar el item" },
      { status: 500 },
    );
  }
}
