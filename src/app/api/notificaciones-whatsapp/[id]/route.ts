import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de conversación inválido" },
        { status: 400 }
      );
    }

    const conversacionEliminada = await prisma.conversacionWhatsApp.delete({
      where: { id: id },
    });

    if (!conversacionEliminada) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mensaje: "Conversación eliminada con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar la conversación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
