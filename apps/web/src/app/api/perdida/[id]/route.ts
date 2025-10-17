import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const perdida = await prisma.perdidas.findUnique({
      where: { id },
      include: {
        dolar: true,
        recuperaciones: true,
      },
    });

    if (!perdida) {
      return NextResponse.json(
        { error: "Registro de pérdida no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(perdida);
  } catch (error) {
    console.error("Error al obtener el registro de pérdida:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { fecha, monto, descripcion, moneda, dolarId, cancelado, cotizacionDolar } = body;

    // Validate the perdida exists
    const existePerdida = await prisma.perdidas.findUnique({
      where: { id },
    });

    if (!existePerdida) {
      return NextResponse.json(
        { error: "Registro de pérdida no encontrado" },
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

    if (
      !descripcion ||
      typeof descripcion !== "string" ||
      descripcion.trim() === ""
    ) {
      return NextResponse.json(
        { error: "La descripción es requerida" },
        { status: 400 }
      );
    }

    const dolar = await prisma.dolar.findFirst({
      where: {
        fecha: {
          lte: new Date(fecha),
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    // Update the perdida
    const perdidaActualizada = await prisma.perdidas.update({
      where: { id },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        monto: monto,
        descripcion: descripcion.trim(),
        moneda: moneda || undefined,
        dolarId: dolar?.id || undefined,
        cotizacionDolar,
      },
      include: {
        dolar: true,
      },
    });

    return NextResponse.json(perdidaActualizada);
  } catch (error) {
    console.error("Error al actualizar el registro de pérdida:", error);
    return NextResponse.json(
      { error: "Error al actualizar el registro de pérdida" },
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

    // Validate the perdida exists
    const existePerdida = await prisma.perdidas.findUnique({
      where: { id },
    });

    if (!existePerdida) {
      return NextResponse.json(
        { error: "Registro de pérdida no encontrado" },
        { status: 404 }
      );
    }

    // Delete the perdida
    const perdidaEliminada = await prisma.perdidas.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Registro de pérdida eliminado con éxito",
      id: perdidaEliminada.id,
    });
  } catch (error) {
    console.error("Error al eliminar el registro de pérdida:", error);
    return NextResponse.json(
      { error: "Error al eliminar el registro de pérdida" },
      { status: 500 }
    );
  }
}
