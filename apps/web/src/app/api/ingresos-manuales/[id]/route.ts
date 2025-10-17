import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { PrismaIngresoManualRepository } from "@/core/infrastructure/database/repositories/prisma-ingreso-manual.repository";
import { updateRevisadoYEnviadoSchema } from "@/core/infrastructure/validation/schemas/resumen-transaccion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import {
  chequeQueryData,
  getChequeIdAndValidate,
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
        tipoOperacion: true,
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { revisado, reciboEnviado } = body;
    const dto = await validateRequest(
      {
        id,
        revisado,
        reciboEnviado,
      },
      updateRevisadoYEnviadoSchema
    );

    const transaccionActualizada = await new UpdateRevisadoUseCase(
      new TransaccionService(new PrismaIngresoManualRepository())
    ).execute(dto);

    return NextResponse.json(transaccionActualizada);
  } catch (error) {
    return handleApiError(error);
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
      tipoOperacionId,
      cotizacionDolar,
      gastosBancarios,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
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

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacionId);
    } catch (error) {
      return NextResponse.json(
        { error: "No se pudo usar el cheque" },
        { status: 400 }
      );
    }
    const ingresoActualizado = await prisma.ingresoManualDeDinero.update({
      where: { id },
      data: {
        monto,
        descripcion,
        fecha: new Date(fecha),
        moneda,
        usuarioId,
        dolarId: dolar?.id,
        tipoOperacionId,
        cotizacionDolar,
        gastosBancarios,
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
