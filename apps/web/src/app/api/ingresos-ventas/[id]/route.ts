import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { PrismaIngresoVentaRepository } from "@/core/infrastructure/database/repositories/prisma-ingreso-venta.repository";
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
      clienteId,
      informacionCliente,
      fecha,
      monto,
      moneda,
      tipoOperacionId,
      descripcion,
      ventaId,
    } = body;

    if (!validateChequeRequest(body, tipoOperacionId)) {
      return NextResponse.json(
        { error: "Faltan datos para la operación de cheque" },
        { status: 400 }
      );
    }

    if (!clienteId && !informacionCliente) {
      return NextResponse.json(
        { error: "Datos de ingreso por venta inválidos o faltantes" },
        { status: 400 }
      );
    }

    if (!monto || !descripcion || !ventaId || !tipoOperacionId) {
      return NextResponse.json(
        { error: "Datos de ingreso por venta inválidos o faltantes" },
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

    const ingresoActualizado = await prisma.ingresoPorVenta.update({
      where: { id },
      data: {
        clienteId,
        informacionCliente,
        monto,
        moneda,
        descripcion,
        ventaId,
        fecha,
        dolarId: dolar?.id,
        tipoOperacionId,
        chequeId: chequeIdToPass,
      },
      include: {
        cliente: true,
        venta: true,
        cheque: chequeQueryData,
      },
    });

    return NextResponse.json(returnModelWithChequeData(ingresoActualizado));
  } catch (error) {
    console.error("Error al actualizar ingreso por venta:", error);
    return NextResponse.json(
      { error: "Error al actualizar el ingreso por venta" },
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
      new TransaccionService(new PrismaIngresoVentaRepository())
    ).execute(dto);

    return NextResponse.json(transaccionActualizada);
  } catch (error) {
    return handleApiError(error);
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
        { error: "ID de ingreso por venta inválido" },
        { status: 400 }
      );
    }

    const ingresoEliminado = await prisma.ingresoPorVenta.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Ingreso por venta eliminado con éxito",
      ingreso: ingresoEliminado,
    });
  } catch (error) {
    console.error("Error al eliminar ingreso por venta:", error);
    return NextResponse.json(
      { error: "Error al eliminar el ingreso por venta" },
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

    const ingreso = await prisma.ingresoPorVenta.findUnique({
      where: { id },
      include: {
        cliente: true,
        venta: true,
        cheque: chequeQueryData,
        tipoOperacion: true,
      },
    });

    if (!ingreso) {
      return NextResponse.json(
        { error: "Ingreso por venta no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(returnModelWithChequeData(ingreso));
  } catch (error) {
    console.error("Error al obtener ingreso por venta:", error);
    return NextResponse.json(
      { error: "Error al obtener el ingreso por venta" },
      { status: 500 }
    );
  }
}
