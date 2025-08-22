import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Nombre de categoría inválido o faltante" },
        { status: 400 }
      );
    }

    const categoriaActualizada = await prisma.categoriaGasto.update({
      where: { id },
      data: { nombre },
    });

    return NextResponse.json(categoriaActualizada);
  } catch (error) {
    console.error("Error al actualizar categoría de gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar la categoría de gasto" },
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
        { error: "ID de categoría de gasto inválido" },
        { status: 400 }
      );
    }

    const categoriaEliminada = await prisma.categoriaGasto.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Categoría de gasto eliminada correctamente",
      categoria: categoriaEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar categoría de gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar la categoría de gasto" },
      { status: 500 }
    );
  }
}
