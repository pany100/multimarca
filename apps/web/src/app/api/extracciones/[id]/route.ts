import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { PrismaExtraccionRepository } from "@/core/infrastructure/database/repositories/prisma-extraccion.repository";
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

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de extracción inválido" },
        { status: 400 }
      );
    }

    const extraccion = await prisma.extraccion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        tipoOperacion: true,
        dolar: true,
        cheque: chequeQueryData,
      },
    });

    if (!extraccion) {
      return NextResponse.json(
        { error: "Extracción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnModelWithChequeData(extraccion));
  } catch (error) {
    console.error("Error al obtener extracción:", error);
    return NextResponse.json(
      { error: "Error al obtener la extracción" },
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
      new TransaccionService(new PrismaExtraccionRepository())
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
      usuarioId,
      motivo,
      moneda,
      chequeId,
      tipoOperacionId,
      fecha,
    } = body;
    if (!validateChequeRequest(body, tipoOperacionId)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

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

    const extraccionActualizada = await prisma.extraccion.update({
      where: { id },
      data: {
        monto,
        usuarioId,
        motivo,
        fecha,
        tipoOperacionId,
        moneda,
        dolarId: dolar?.id,
        chequeId: chequeIdToPass,
      },
      include: {
        usuario: {
          select: {
            fullName: true,
          },
        },
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(extraccionActualizada));
  } catch (error) {
    console.error("Error al actualizar extracción:", error);
    return NextResponse.json(
      { error: `Error al actualizar la extracción ${error}` },
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
