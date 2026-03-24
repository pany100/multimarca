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

import { sendWhatsappTextMessage } from "@/services/notificaciones-whataspp-old";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();
    const { mensaje } = body;

    if (!mensaje) {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    const conversacion = await prisma.conversacionWhatsApp.findUnique({
      where: { id },
      include: { cliente: true },
    });

    if (!conversacion) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    const numeroDestino = conversacion.cliente.phone;
    if (!numeroDestino) {
      return NextResponse.json(
        { error: "El cliente no tiene un número de teléfono asignado" },
        { status: 400 }
      );
    }

    // Enviar mensaje de WhatsApp
    await sendWhatsappTextMessage(numeroDestino, mensaje);

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
        { status: 500 }
      );
    }

    return NextResponse.json(conversacionActualizada, { status: 200 });
  } catch (error) {
    console.error("Error al enviar y guardar el mensaje:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
