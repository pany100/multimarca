import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

// GET a specific recuperacion
export async function GET(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const perdidaId = parseInt(params.id);
    const recuperacionId = parseInt(params.recuperacionId);

    const recuperacion = await prisma.recuperacion.findUnique({
      where: { id: recuperacionId },
    });

    if (!recuperacion || recuperacion.perdidaId !== perdidaId) {
      return NextResponse.json(
        { error: "Recuperación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(recuperacion);
  } catch (error) {
    console.error("Error al obtener la recuperación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT to update a specific recuperacion
export async function PUT(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const perdidaId = parseInt(params.id);
    const recuperacionId = parseInt(params.recuperacionId);
    const body = await request.json();
    const { fecha, monto, detalle } = body;

    // Validate the recuperacion exists and belongs to the perdida
    const existeRecuperacion = await prisma.recuperacion.findUnique({
      where: { id: recuperacionId },
    });

    if (!existeRecuperacion || existeRecuperacion.perdidaId !== perdidaId) {
      return NextResponse.json(
        { error: "Recuperación no encontrada" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número mayor que cero" },
        { status: 400 }
      );
    }

    // Update the recuperacion
    const recuperacionActualizada = await prisma.recuperacion.update({
      where: { id: recuperacionId },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        monto,
        detalle: detalle || null,
      },
    });

    return NextResponse.json(recuperacionActualizada);
  } catch (error) {
    console.error("Error al actualizar la recuperación:", error);
    return NextResponse.json(
      { error: "Error al actualizar la recuperación" },
      { status: 500 }
    );
  }
}

// DELETE a specific recuperacion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; recuperacionId: string } }
) {
  try {
    const perdidaId = parseInt(params.id);
    const recuperacionId = parseInt(params.recuperacionId);

    // Validate the recuperacion exists and belongs to the perdida
    const existeRecuperacion = await prisma.recuperacion.findUnique({
      where: { id: recuperacionId },
    });

    if (!existeRecuperacion || existeRecuperacion.perdidaId !== perdidaId) {
      return NextResponse.json(
        { error: "Recuperación no encontrada" },
        { status: 404 }
      );
    }

    // Delete the recuperacion
    const recuperacionEliminada = await prisma.recuperacion.delete({
      where: { id: recuperacionId },
    });

    return NextResponse.json({
      message: "Recuperación eliminada con éxito",
      id: recuperacionEliminada.id,
    });
  } catch (error) {
    console.error("Error al eliminar la recuperación:", error);
    return NextResponse.json(
      { error: "Error al eliminar la recuperación" },
      { status: 500 }
    );
  }
}
