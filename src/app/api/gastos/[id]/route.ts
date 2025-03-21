import {
  chequeQueryData,
  deleteCheque,
  getChequeForOperation,
  getChequeId,
  returnModelWithChequeData,
  validateChequeRequest,
} from "@/utils/chequeUtils";
import { OperacionCheque } from "@prisma/client";
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
      nombre,
      precio,
      moneda,
      tipo,
      fecha,
      categoriaId,
      mecanicoId,
      proveedorId,
      detalle,
    } = body;

    if (!validateChequeRequest(body, tipo)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!nombre || !precio || !fecha || !categoriaId) {
      return NextResponse.json(
        { error: "Datos de gasto inválidos o faltantes" },
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

    const chequeIdToPass = await getChequeId(body, tipo);

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data: {
        nombre,
        moneda,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        tipo,
        proveedorId,
        detalle,
        dolarId: dolar?.id,
        chequeId: chequeIdToPass,
      },
      include: {
        categoria: true,
        mecanico: true,
        proveedor: true,
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(gastoActualizado));
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el gasto" },
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
        { error: "ID de gasto inválido" },
        { status: 400 }
      );
    }

    const cheque = await getChequeForOperation(OperacionCheque.GASTO, id);
    if (cheque) {
      await deleteCheque(cheque.id);
    }

    const gastoEliminado = await prisma.gasto.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Gasto eliminado correctamente",
      gasto: gastoEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el gasto" },
      { status: 500 }
    );
  }
}
