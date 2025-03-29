import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const stock = await prisma.stock.findUnique({
      where: { id },
      select: {
        label: true,
        name: true,
        brand: true,
        buyPrice: true,
        markup: true,
        id: true,
      },
    });

    if (!stock) {
      return NextResponse.json(
        { error: "Stock no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error al obtener el stock:", error);
    return NextResponse.json(
      { error: "Error al obtener el stock" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      brand,
      buyPrice,
      units,
      restockValue,
      label,
      markup,
      proveedorId,
    } = body;

    if (
      !name ||
      typeof name !== "string" ||
      !brand ||
      typeof brand !== "string"
    ) {
      return NextResponse.json(
        { error: "Nombre o marca del stock inválido o faltante" },
        { status: 400 }
      );
    }

    const stockActualizado = await prisma.stock.update({
      where: { id },
      data: {
        name,
        brand,
        buyPrice,
        units,
        restockValue: restockValue ? parseInt(restockValue, 10) : null,
        label,
        markup: markup ? parseFloat(markup) : null,
        proveedorId,
      },
      include: {
        proveedor: true,
      },
    });

    return NextResponse.json(stockActualizado);
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return NextResponse.json(
      { error: "Error al actualizar el stock" },
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

    const stockEliminado = await prisma.stock.delete({
      where: { id },
    });

    if (!stockEliminado) {
      return NextResponse.json(
        { error: "Stock no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Stock eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar stock:", error);
    return NextResponse.json(
      { error: "Error al eliminar el stock" },
      { status: 500 }
    );
  }
}
