import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      clienteId,
      fecha,
      monto,
      moneda,
      tipoOperacion,
      descripcion,
      ordenReparacionId,
    } = body;

    if (
      !clienteId ||
      !monto ||
      !descripcion ||
      !ordenReparacionId ||
      !tipoOperacion
    ) {
      return NextResponse.json(
        { error: "Datos de ingreso por reparación inválidos o faltantes" },
        { status: 400 }
      );
    }

    if (!moneda || !["Dolar", "Peso"].includes(moneda)) {
      return NextResponse.json(
        { error: "Moneda inválida o faltante" },
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

    const ingresoActualizado = await prisma.ingresoPorReparacion.update({
      where: { id },
      data: {
        clienteId,
        monto,
        moneda,
        descripcion,
        ordenReparacionId,
        fecha,
        dolarId: dolar?.id,
        tipoOperacion,
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
