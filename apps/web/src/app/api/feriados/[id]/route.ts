import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { fecha, descripcion } = body;

    if (!fecha || !descripcion) {
      return NextResponse.json(
        { error: "Fecha y descripción son requeridos" },
        { status: 400 }
      );
    }

    // Get the existing feriado to check its date
    const existingFeriado = await prisma.feriado.findUnique({
      where: { id },
    });

    if (!existingFeriado) {
      return NextResponse.json(
        { error: "Feriado no encontrado" },
        { status: 404 }
      );
    }

    // Check if the existing feriado is in the past
    const existingDate = new Date(existingFeriado.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (existingDate < today) {
      return NextResponse.json(
        { error: "No se puede modificar un feriado de una fecha pasada" },
        { status: 400 }
      );
    }

    // Update the feriado
    const feriadoActualizado = await prisma.feriado.update({
      where: { id },
      data: {
        fecha: new Date(fecha),
        descripcion,
      },
    });

    return NextResponse.json(feriadoActualizado);
  } catch (error) {
    console.error("Error al actualizar feriado:", error);
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

    // Get the feriado to check its date before deleting
    const feriado = await prisma.feriado.findUnique({
      where: { id },
    });

    if (!feriado) {
      return NextResponse.json(
        { error: "Feriado no encontrado" },
        { status: 404 }
      );
    }

    // Check if the feriado is in the past
    const feriadoDate = new Date(feriado.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (feriadoDate < today) {
      return NextResponse.json(
        { error: "No se puede eliminar un feriado de una fecha pasada" },
        { status: 400 }
      );
    }

    // Delete the feriado
    await prisma.feriado.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feriado eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar feriado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
