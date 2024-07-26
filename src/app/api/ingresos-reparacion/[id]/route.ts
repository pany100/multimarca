import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { clienteId, monto, descripcion, ordenReparacionId } = body;

    if (!clienteId || !monto || !descripcion || !ordenReparacionId) {
      return NextResponse.json(
        { error: "Datos de ingreso por reparación inválidos o faltantes" },
        { status: 400 }
      );
    }

    const ingresoActualizado = await prisma.ingresoPorReparacion.update({
      where: { id },
      data: {
        clienteId,
        monto,
        descripcion,
        ordenReparacionId,
        fecha: new Date(),
      },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
          },
        },
      },
    });

    return NextResponse.json(ingresoActualizado);
  } catch (error) {
    console.error("Error al actualizar ingreso por reparación:", error);
    return NextResponse.json(
      { error: "Error al actualizar el ingreso por reparación" },
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

    await prisma.ingresoPorReparacion.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Ingreso por reparación eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar ingreso por reparación:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ingreso por reparación" },
      { status: 500 }
    );
  }
}
