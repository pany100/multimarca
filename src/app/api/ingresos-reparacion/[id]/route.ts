import {
  chequeQueryData,
  getChequeIdAndValidate,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
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
      tipoOperacionId,
      descripcion,
      ordenReparacionId,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (
      !clienteId ||
      !monto ||
      !descripcion ||
      !ordenReparacionId ||
      !tipoOperacionId
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

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacionId);
    } catch (error) {
      return NextResponse.json(
        { error: "No se pudo usar el cheque" },
        { status: 400 }
      );
    }

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
        tipoOperacionId,
        chequeId: chequeIdToPass,
      },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(ingresoActualizado));
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

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de ingreso por reparación inválido" },
        { status: 400 }
      );
    }

    const ingresoEliminado = await prisma.ingresoPorReparacion.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Ingreso por reparación eliminado con éxito",
      ingreso: ingresoEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar ingreso por reparación:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ingreso por reparación" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const ingreso = await prisma.ingresoPorReparacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordenReparacion: {
          include: {
            auto: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    if (!ingreso) {
      return NextResponse.json(
        { error: "Ingreso por reparación no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnModelWithChequeData(ingreso));
  } catch (error) {
    console.error("Error al obtener ingreso por reparación:", error);
    return NextResponse.json(
      { error: "Error al obtener el ingreso por reparación" },
      { status: 500 }
    );
  }
}
