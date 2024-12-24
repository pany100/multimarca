import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { monto, usuarioId, motivo, moneda, tipoExtraccion, fecha } = body;

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== "number") {
      return NextResponse.json(
        { error: "ID de usuario inválido o faltante" },
        { status: 400 }
      );
    }

    if (!motivo || typeof motivo !== "string") {
      return NextResponse.json(
        { error: "Motivo de extracción inválido o faltante" },
        { status: 400 }
      );
    }

    if (
      !tipoExtraccion ||
      !["EFECTIVO", "TRANSFERENCIA", "CHEQUE"].includes(tipoExtraccion)
    ) {
      return NextResponse.json(
        { error: "Tipo de extracción inválido o faltante" },
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

    const extraccionActualizada = await prisma.extraccion.update({
      where: { id },
      data: {
        monto,
        usuarioId,
        motivo,
        fecha,
        tipoExtraccion,
        moneda,
        dolarId: dolar?.id,
      },
      include: {
        usuario: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(extraccionActualizada);
  } catch (error) {
    console.error("Error al actualizar extracción:", error);
    return NextResponse.json(
      { error: "Error al actualizar la extracción" },
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

    const extraccionEliminada = await prisma.extraccion.delete({
      where: { id },
    });

    if (!extraccionEliminada) {
      return NextResponse.json(
        { error: "Extracción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Extracción eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar extracción:", error);
    return NextResponse.json(
      { error: "Error al eliminar la extracción" },
      { status: 500 }
    );
  }
}
