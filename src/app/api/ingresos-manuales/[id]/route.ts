import {
  chequeQueryData,
  getChequeId,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const ingreso = await prisma.ingresoManualDeDinero.findUnique({
      where: { id },
      include: {
        dolar: true,
        usuario: {
          select: {
            fullName: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    if (!ingreso) {
      return NextResponse.json(
        { error: "Ingreso manual no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnModelWithChequeData(ingreso));
  } catch (error) {
    console.error("Error al obtener ingreso manual:", error);
    return NextResponse.json(
      { error: "Error al obtener el ingreso manual" },
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
    const { monto, descripcion, usuarioId, moneda, fecha, tipoExtraccion } =
      body;

    if (!validateChequeRequest(body, tipoExtraccion)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!monto || typeof monto !== "number" || monto <= 0) {
      return NextResponse.json(
        { error: "Monto inválido o faltante" },
        { status: 400 }
      );
    }

    if (!usuarioId || typeof usuarioId !== "number") {
      return NextResponse.json(
        { error: "ID de usuario inválido o faltante" },
        { status: 400 }
      );
    }

    if (!fecha) {
      return NextResponse.json(
        { error: "Fecha inválida o faltante" },
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

    const chequeIdToPass = await getChequeId(body, tipoExtraccion);

    const ingresoActualizado = await prisma.ingresoManualDeDinero.update({
      where: { id },
      data: {
        monto,
        descripcion,
        fecha: new Date(fecha),
        moneda,
        usuarioId,
        dolarId: dolar?.id,
        tipoExtraccion,
        chequeId: chequeIdToPass,
      },
      include: {
        dolar: true,
        usuario: {
          select: {
            fullName: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(ingresoActualizado));
  } catch (error) {
    console.error("Error al actualizar ingreso manual:", error);
    return NextResponse.json(
      { error: "Error al actualizar el ingreso manual" },
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
    const ingresoEliminado = await prisma.ingresoManualDeDinero.delete({
      where: { id },
    });

    if (!ingresoEliminado) {
      return NextResponse.json(
        { error: "Ingreso manual no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Ingreso manual eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar ingreso manual:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ingreso manual" },
      { status: 500 }
    );
  }
}
