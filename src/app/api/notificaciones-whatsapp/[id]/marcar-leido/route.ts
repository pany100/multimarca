import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(
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

    // Actualizar todos los mensajes de la conversación como leídos
    await prisma.mensajeWhatsApp.updateMany({
      where: {
        conversacionId: id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Obtener la conversación actualizada
    const conversacionActualizada =
      await prisma.conversacionWhatsApp.findUnique({
        where: { id },
        include: {
          cliente: true,
          mensajes: {
            orderBy: {
              timestamp: "asc",
            },
          },
        },
      });

    if (!conversacionActualizada) {
      return NextResponse.json(
        { error: "No se pudo obtener la conversación actualizada" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversacionActualizada, { status: 200 });
  } catch (error) {
    console.error("Error al marcar los mensajes como leídos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
