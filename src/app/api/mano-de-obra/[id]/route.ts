import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, sellPrice } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nombre de trabajo inválido o faltante" },
        { status: 400 }
      );
    }

    if (isNaN(parseFloat(sellPrice))) {
      return NextResponse.json(
        { error: "Precio de venta inválido" },
        { status: 400 }
      );
    }

    const sellPriceNumber = parseFloat(sellPrice);

    const trabajoActualizado = await prisma.manoDeObra.update({
      where: { id },
      data: {
        name,
        sellPrice: sellPriceNumber,
      },
    });

    return NextResponse.json(trabajoActualizado);
  } catch (error) {
    console.error("Error al actualizar trabajo de mano de obra:", error);
    return NextResponse.json(
      { error: "Error al actualizar el trabajo de mano de obra" },
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

    const trabajoEliminado = await prisma.manoDeObra.delete({
      where: { id },
    });

    if (!trabajoEliminado) {
      return NextResponse.json(
        { error: "Trabajo de mano de obra no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Trabajo de mano de obra eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar trabajo de mano de obra:", error);
    return NextResponse.json(
      { error: "Error al eliminar el trabajo de mano de obra" },
      { status: 500 }
    );
  }
}
