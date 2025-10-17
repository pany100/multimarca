import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { PrismaGastoRepository } from "@/core/infrastructure/database/repositories/prisma-gasto.repository";
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
      tipoOperacionId,
      fecha,
      categoriaId,
      mecanicoId,
      proveedorId,
      detalle,
      cotizacionDolar,
      gastosBancarios,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
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

    let chequeIdToPass = null;
    try {
      chequeIdToPass = await getChequeIdAndValidate(body, tipoOperacionId);
    } catch (error) {
      return NextResponse.json(
        { error: "No se pudo usar el cheque" },
        { status: 400 }
      );
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data: {
        nombre,
        moneda,
        precio,
        fecha: new Date(fecha),
        categoriaId,
        mecanicoId,
        tipoOperacionId,
        proveedorId,
        detalle,
        dolarId: dolar?.id,
        chequeId: chequeIdToPass,
        cotizacionDolar,
        gastosBancarios,
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
      new TransaccionService(new PrismaGastoRepository())
    ).execute(dto);

    return NextResponse.json(transaccionActualizada);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
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

    const gasto = await prisma.gasto.findUnique({
      where: { id },
      include: {
        categoria: {
          include: {
            roles: true,
          },
        },
        tipoOperacion: true,
        mecanico: true,
        proveedor: true,
        cheque: chequeQueryData,
      },
    });

    if (!gasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnModelWithChequeData(gasto));
  } catch (error) {
    console.error("Error al obtener gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
