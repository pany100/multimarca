import { getIO } from "@/lib/socketio";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import { getCurrentUser } from "src/utils/authFetch";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseInt(params.id);

    // Verify notification ownership
    const notificacion = await prisma.notificacionInterna.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notificacion.userId !== null && notificacion.userId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta notificación" },
        { status: 403 }
      );
    }

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

    const io = getIO();
    if (leida === false) {
      if (io) {
        io.emit("newNotification");
      }
    } else {
      if (io) {
        io.emit("readNotification");
      }
    }

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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseInt(params.id);

    // Verify notification ownership
    const notificacion = await prisma.notificacionInterna.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notificacion.userId !== null && notificacion.userId !== user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta notificación" },
        { status: 403 }
      );
    }

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
