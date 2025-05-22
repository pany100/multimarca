import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET a single recordatorio by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de recordatorio inválido" },
        { status: 400 }
      );
    }

    const recordatorio = await prisma.recordatorioAgenda.findUnique({
      where: { id },
    });

    if (!recordatorio) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(recordatorio);
  } catch (error) {
    console.error("Error al obtener recordatorio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT to update a recordatorio
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de recordatorio inválido" },
        { status: 400 }
      );
    }

    // Check if recordatorio exists
    const existingRecordatorio = await prisma.recordatorioAgenda.findUnique({
      where: { id },
    });

    if (!existingRecordatorio) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { titulo, descripcion, fecha, hecho } = body;

    // Validate required fields
    if (!titulo) {
      return NextResponse.json(
        { error: "El título es un campo requerido" },
        { status: 400 }
      );
    }

    // Validate fecha if provided
    let fechaDate = existingRecordatorio.fecha;
    if (fecha) {
      fechaDate = new Date(fecha);
      if (isNaN(fechaDate.getTime())) {
        return NextResponse.json(
          { error: "La fecha proporcionada no es válida" },
          { status: 400 }
        );
      }
    }

    // Update the recordatorio
    const updatedRecordatorio = await prisma.recordatorioAgenda.update({
      where: { id },
      data: {
        titulo,
        descripcion: descripcion ?? existingRecordatorio.descripcion,
        fecha: fechaDate,
        hecho: hecho !== undefined ? hecho : existingRecordatorio.hecho,
      },
    });

    return NextResponse.json(updatedRecordatorio);
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE a recordatorio
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de recordatorio inválido" },
        { status: 400 }
      );
    }

    // Check if recordatorio exists
    const existingRecordatorio = await prisma.recordatorioAgenda.findUnique({
      where: { id },
    });

    if (!existingRecordatorio) {
      return NextResponse.json(
        { error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    // Delete the recordatorio
    await prisma.recordatorioAgenda.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Recordatorio eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar recordatorio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
