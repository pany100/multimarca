import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

async function recalcularPrecioTotal(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  ordenDeCompraId: number,
) {
  const [items, orden] = await Promise.all([
    tx.ordenDeCompraItem.findMany({ where: { ordenDeCompraId } }),
    tx.ordenDeCompra.findUnique({
      where: { id: ordenDeCompraId },
      select: { percepcion: true },
    }),
  ]);
  const totalItems = items.reduce((total, item) => {
    const precio = Number(item.precioUnitario) || 0;
    const iva = Number(item.iva) || 0;
    return total + precio * (1 + iva / 100) * item.cantidad;
  }, 0);
  const precioTotal = totalItems + Number(orden?.percepcion ?? 0);
  await tx.ordenDeCompra.update({
    where: { id: ordenDeCompraId },
    data: { precioTotal },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const ordenDeCompraId = parseInt(params.id);

    if (isNaN(ordenDeCompraId)) {
      return NextResponse.json(
        { error: "ID de orden de compra inválido" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { stockId, cantidad, precioUnitario, iva } = body;

    if (!stockId || !cantidad) {
      return NextResponse.json(
        { error: "stockId y cantidad son requeridos" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Verificar que la orden existe
      const orden = await tx.ordenDeCompra.findUnique({
        where: { id: ordenDeCompraId },
      });

      if (!orden) {
        throw new Error("Orden de compra no encontrada");
      }

      // Crear el item
      const item = await tx.ordenDeCompraItem.create({
        data: {
          ordenDeCompraId,
          stockId,
          cantidad,
          precioUnitario: precioUnitario ?? null,
          iva: iva ?? null,
        },
        include: { stock: true },
      });

      // Incrementar stock
      const stock = await tx.stock.findUnique({
        where: { id: stockId },
        select: { units: true },
      });

      await tx.stock.update({
        where: { id: stockId },
        data: {
          units:
            stock?.units === null ? cantidad : { increment: cantidad },
        },
      });

      // Recalcular precioTotal
      await recalcularPrecioTotal(tx, ordenDeCompraId);

      return item;
    });

    const itemConLabel = {
      ...result,
      name: result.stock.name,
      label: result.stock.label,
    };

    return NextResponse.json(itemConLabel, { status: 201 });
  } catch (error: any) {
    console.error("Error al agregar item:", error);
    if (error.message === "Orden de compra no encontrada") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error al agregar el item a la orden de compra" },
      { status: 500 },
    );
  }
}
