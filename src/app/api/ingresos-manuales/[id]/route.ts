import {
  deleteCheque,
  getChequeForOperation,
  updateCheque,
} from "@/utils/chequeUtils";
import { OperacionCheque, TipoOperacion } from "@prisma/client";
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
      },
    });

    if (!ingreso) {
      return NextResponse.json(
        { error: "Ingreso manual no encontrado" },
        { status: 404 }
      );
    }
    if (ingreso.tipoExtraccion === "CHEQUE") {
      const cheque = await getChequeForOperation(
        OperacionCheque.INGRESO_MANUAL,
        ingreso.id
      );
      const ingresoToReturn = {
        ...ingreso,
        banco: cheque?.banco,
        emisor: cheque?.owner,
        fechaCobro: cheque?.fechaCobro,
        fechaEmision: cheque?.fechaEmision,
        importe: cheque?.importe,
        numeroCheque: cheque?.numero,
        picturePath: cheque?.picturePath,
        chequeId: cheque?.id,
      };
      return NextResponse.json(ingresoToReturn);
    }

    return NextResponse.json(ingreso);
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
    const {
      monto,
      descripcion,
      usuarioId,
      moneda,
      fecha,
      tipoExtraccion,
      banco,
      emisor,
      fechaCobro,
      fechaEmision,
      importe,
      numeroCheque,
      picturePath,
    } = body;

    if (tipoExtraccion === TipoOperacion.CHEQUE) {
      if (
        !banco ||
        !emisor ||
        !fechaCobro ||
        !fechaEmision ||
        !importe ||
        !numeroCheque ||
        !picturePath
      ) {
        return NextResponse.json(
          { error: "Faltan datos para la operación de cheque" },
          { status: 400 }
        );
      }
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
      },
      include: {
        dolar: true,
        usuario: {
          select: {
            fullName: true,
          },
        },
      },
    });

    const newCheque = await updateCheque({
      cheque: {
        banco,
        emisor,
        fechaCobro,
        fechaEmision,
        importe,
        numeroCheque,
        picturePath,
      },
      tipoOperacion: tipoExtraccion,
      operacionCheque: OperacionCheque.INGRESO_MANUAL,
      idOperacion: id,
    });

    return NextResponse.json({
      ...ingresoActualizado,
      banco: newCheque?.banco,
      emisor: newCheque?.owner,
      fechaCobro: newCheque?.fechaCobro,
      fechaEmision: newCheque?.fechaEmision,
      importe: newCheque?.importe,
      numeroCheque: newCheque?.numero,
      picturePath: newCheque?.picturePath,
      chequeId: newCheque?.id,
    });
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

    const cheque = await getChequeForOperation(
      OperacionCheque.INGRESO_MANUAL,
      id
    );
    if (cheque) {
      await deleteCheque(cheque.id);
    }

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
