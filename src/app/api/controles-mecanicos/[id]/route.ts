import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "El nombre y el tipo son obligatorios" },
        { status: 400 }
      );
    }

    const controlActualizado = await prisma.controlMecanico.update({
      where: { id },
      data: {
        name,
        type,
      },
    });

    return NextResponse.json(controlActualizado);
  } catch (error) {
    console.error("Error al actualizar control mecánico:", error);
    return NextResponse.json(
      { error: "Error al actualizar el control mecánico" },
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

    const controlEliminado = await prisma.controlMecanico.delete({
      where: { id },
    });

    if (!controlEliminado) {
      return NextResponse.json(
        { error: "Control mecánico no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Control mecánico eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar control mecánico:", error);
    return NextResponse.json(
      { error: "Error al eliminar el control mecánico" },
      { status: 500 }
    );
  }
}
