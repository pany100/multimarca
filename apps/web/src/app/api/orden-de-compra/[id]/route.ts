import { calcularPrecioTotalOrdenDeCompra } from "@/core/application/services/orden-de-compra-total.service";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

const ORDEN_DE_COMPRA_INCLUDE = {
  proveedor: true,
  items: { include: { stock: true } },
  ajustesPrecio: true,
} as const;

const decorarOrden = <T extends { items: { stock: { name: string; label: string | null; id: number } }[] }>(
  orden: T,
) => ({
  ...orden,
  items: orden.items.map((item) => ({
    ...item,
    name: item.stock.name,
    label: item.stock.label,
    stockId: item.stock.id,
  })),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { fecha, proveedorId, items, percepcion } = body;

    if (!proveedorId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos de orden de compra inválidos o faltantes" },
        { status: 400 },
      );
    }

    const ordenDeCompraActualizada = await prisma.$transaction(
      async (prisma) => {
        const ordenActual = await prisma.ordenDeCompra.findUnique({
          where: { id },
          include: {
            items: { include: { stock: true } },
            ajustesPrecio: true,
          },
        });

        if (!ordenActual) {
          throw new Error("Orden de compra no encontrada");
        }

        for (const itemActual of ordenActual.items) {
          const itemNuevo = items.find((item) => item.id === itemActual.id);
          if (!itemNuevo) {
            const stockActualizado = await prisma.stock.update({
              where: { id: itemActual.stockId },
              data: { units: { decrement: itemActual.cantidad } },
            });

            if (
              stockActualizado.units !== null &&
              Number(stockActualizado.units) < 0
            ) {
              throw new Error(
                `Stock insuficiente para el ítem ${itemActual.stock.name}`,
              );
            }
          }
        }

        const percepcionNum = Number(percepcion) || 0;
        const precioTotalCalculado = calcularPrecioTotalOrdenDeCompra(
          items,
          percepcionNum,
          ordenActual.ajustesPrecio.map((a) => ({
            descripcion: a.descripcion,
            monto: Number(a.monto),
            tipo: a.tipo,
            esDescuento: a.esDescuento,
            esInterno: a.esInterno,
            orden: a.orden,
          })),
        );

        const ordenActualizada = await prisma.ordenDeCompra.update({
          where: { id },
          data: {
            fecha: fecha ? new Date(fecha) : new Date(),
            proveedorId,
            precioTotal: precioTotalCalculado,
            percepcion: percepcionNum,
            items: {
              deleteMany: {},
              create: items.map((item: any) => ({
                cantidad: item.cantidad,
                stockId: item.stockId,
                precioUnitario: item.precioUnitario ?? null,
                iva: item.iva ?? null,
              })),
            },
          },
          include: ORDEN_DE_COMPRA_INCLUDE,
        });

        for (const item of items) {
          await prisma.stock.update({
            where: { id: item.stockId },
            data: { units: { increment: item.cantidad } },
          });
        }

        return ordenActualizada;
      },
    );

    return NextResponse.json(decorarOrden(ordenDeCompraActualizada));
  } catch (error) {
    console.error("Error al actualizar orden de compra:", error);
    return NextResponse.json(
      { error: `Error al actualizar la orden de compra: ${error}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de orden de compra inválido" },
        { status: 400 },
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
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de orden de compra inválido" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { fecha, proveedorId, percepcion } = body;

    const data: any = {};
    if (fecha !== undefined) data.fecha = new Date(fecha);
    if (proveedorId !== undefined) data.proveedorId = proveedorId;
    if (percepcion !== undefined) data.percepcion = Number(percepcion) || 0;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron datos para actualizar" },
        { status: 400 },
      );
    }

    if (percepcion !== undefined) {
      const ordenActual = await prisma.ordenDeCompra.findUnique({
        where: { id },
        include: { items: true, ajustesPrecio: true },
      });
      if (!ordenActual) {
        return NextResponse.json(
          { error: "Orden de compra no encontrada" },
          { status: 404 },
        );
      }
      data.precioTotal = calcularPrecioTotalOrdenDeCompra(
        ordenActual.items,
        percepcion,
        ordenActual.ajustesPrecio.map((a) => ({
          descripcion: a.descripcion,
          monto: Number(a.monto),
          tipo: a.tipo,
          esDescuento: a.esDescuento,
          esInterno: a.esInterno,
          orden: a.orden,
        })),
      );
    }

    const ordenActualizada = await prisma.ordenDeCompra.update({
      where: { id },
      data,
      include: ORDEN_DE_COMPRA_INCLUDE,
    });

    return NextResponse.json(decorarOrden(ordenActualizada));
  } catch (error) {
    console.error("Error al actualizar orden de compra:", error);
    return NextResponse.json(
      { error: "Error al actualizar la orden de compra" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de orden de compra inválido" },
        { status: 400 },
      );
    }

    const ordenDeCompra = await prisma.ordenDeCompra.findUnique({
      where: { id },
      include: ORDEN_DE_COMPRA_INCLUDE,
    });

    if (!ordenDeCompra) {
      return NextResponse.json(
        { error: "Orden de compra no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(decorarOrden(ordenDeCompra));
  } catch (error) {
    console.error("Error al obtener orden de compra:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
