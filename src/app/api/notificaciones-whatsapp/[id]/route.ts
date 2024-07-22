import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { description, date, whatsappKey } = body;

    const notificacion = await prisma.notificacionWhatsapp.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    const fechaHoy = new Date();
    const fechaNotificacion = new Date(notificacion.date);

    if (fechaHoy >= fechaNotificacion) {
      return NextResponse.json(
        { error: "No se puede editar una notificación pasada" },
        { status: 400 }
      );
    }

    const notificacionActualizada = await prisma.notificacionWhatsapp.update({
      where: { id },
      data: {
        description,
        date: date ? new Date(date) : undefined,
        whatsappKey,
      },
    });

    return NextResponse.json(notificacionActualizada);
  } catch (error) {
    console.error("Error al actualizar notificación de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error al actualizar la notificación" },
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

    const notificacion = await prisma.notificacionWhatsapp.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    const fechaHoy = new Date();
    const fechaNotificacion = new Date(notificacion.date);

    if (fechaHoy >= fechaNotificacion) {
      return NextResponse.json(
        { error: "No se puede eliminar una notificación pasada" },
        { status: 400 }
      );
    }

    await prisma.notificacionWhatsapp.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Notificación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar notificación de WhatsApp:", error);
    return NextResponse.json(
      { error: "Error al eliminar la notificación" },
      { status: 500 }
    );
  }
}
