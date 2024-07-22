import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre, precio, fecha, categoriaId, mecanicoId, ordenDeCompraId } =
      body;

    if (!nombre || !precio || !fecha || !categoriaId) {
      return NextResponse.json(
        { error: "Datos de gasto inválidos o faltantes" },
        { status: 400 }
      );
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data: {
        nombre,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        ordenDeCompraId,
      },
      include: {
        categoria: true,
        mecanico: true,
        ordenDeCompra: true,
      },
    });

    return NextResponse.json(gastoActualizado);
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el gasto" },
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
        { error: "ID de gasto inválido" },
        { status: 400 }
      );
    }

    const gastoEliminado = await prisma.gasto.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Gasto eliminado correctamente",
      gasto: gastoEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el gasto" },
      { status: 500 }
    );
  }
}
