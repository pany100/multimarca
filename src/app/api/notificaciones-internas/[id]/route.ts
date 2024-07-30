import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { leida } = body;

    if (typeof leida !== "boolean") {
      return NextResponse.json(
        { error: "El valor de 'leida' debe ser un booleano" },
        { status: 400 }
      );
    }

    const notificacionActualizada = await prisma.notificacionInterna.update({
      where: { id },
      data: { leida },
    });

    return NextResponse.json(notificacionActualizada);
  } catch (error) {
    console.error("Error al actualizar notificación interna:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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

    const notificacionEliminada = await prisma.notificacionInterna.delete({
      where: { id },
    });

    return NextResponse.json({
      mensaje: "Notificación interna eliminada correctamente",
      notificacion: notificacionEliminada,
    });
  } catch (error) {
    console.error("Error al eliminar notificación interna:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
