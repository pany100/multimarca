import prisma from "@/lib/prisma";
import { getIO } from "@/lib/socketio";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Obtener el usuario actual para verificar permisos
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que la tarea exista y pertenezca al usuario actual
    const tarea = await prisma.tareaDiaria.findUnique({
      where: { id },
    });

    if (!tarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la tarea pertenece al usuario actual (a menos que sea admin)
    if (tarea.usuarioId !== user.id && user.rol?.name !== "Admin") {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta tarea" },
        { status: 403 }
      );
    }

    // Validar los campos
    const updateData: any = {};

    if (body.descripcion !== undefined) {
      if (typeof body.descripcion !== "string" || !body.descripcion.trim()) {
        return NextResponse.json(
          { error: "La descripción es requerida y debe ser un texto válido" },
          { status: 400 }
        );
      }
      updateData.descripcion = body.descripcion;
    }

    if (body.realizado !== undefined) {
      if (typeof body.realizado !== "boolean") {
        return NextResponse.json(
          { error: "El estado 'realizado' debe ser un valor booleano" },
          { status: 400 }
        );
      }
      updateData.realizado = body.realizado;
    }

    // Actualizar la tarea
    const updatedTarea = await prisma.tareaDiaria.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
    const io = getIO();
    if (updatedTarea.realizado) {
      if (io) {
        io.emit("deleteTarea");
      }
    } else {
      if (io) {
        io.emit("newTarea");
      }
    }

    return NextResponse.json(updatedTarea);
  } catch (error) {
    console.error("Error al actualizar tarea diaria:", error);
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

    // Obtener el usuario actual para verificar permisos
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que la tarea exista y pertenezca al usuario actual
    const tarea = await prisma.tareaDiaria.findUnique({
      where: { id },
    });

    if (!tarea) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la tarea pertenece al usuario actual (a menos que sea admin)
    if (tarea.usuarioId !== user.id && user.rol?.name !== "Admin") {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta tarea" },
        { status: 403 }
      );
    }

    // Eliminar la tarea
    await prisma.tareaDiaria.delete({
      where: { id },
    });

    const io = getIO();
    if (io) {
      io.emit("deleteTarea");
    }

    return NextResponse.json(
      { message: "Tarea eliminada con éxito" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar tarea diaria:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
