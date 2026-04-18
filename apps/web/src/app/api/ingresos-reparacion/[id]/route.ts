import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { PrismaIngresoReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-ingreso-reparacion.repository";
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

const ordenFullInclude = {
  repuestosUsados: { include: { stock: true } },
  reparacionesDeTercero: { include: { proveedor: true, reciboFile: true } },
  trabajosRealizados: true,
  ingresos: { include: { dolar: true, tipoOperacion: true } },
  auto: { include: { owner: true } },
  ajustesPrecio: true,
};

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
      cotizacionDolar,
      gastosBancarios,
      gastosArba,
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
        cotizacionDolar,
        gastosBancarios,
        gastosArba,
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Si solo viene revisado/reciboEnviado, usar el flujo existente
    const isStatusUpdate =
      ("revisado" in body || "reciboEnviado" in body) &&
      !("monto" in body) &&
      !("fecha" in body);

    if (isStatusUpdate) {
      const { revisado, reciboEnviado } = body;
      const dto = await validateRequest(
        { id, revisado, reciboEnviado },
        updateRevisadoYEnviadoSchema
      );

      const transaccionActualizada = await new UpdateRevisadoUseCase(
        new TransaccionService(new PrismaIngresoReparacionRepository())
      ).execute(dto);

      return NextResponse.json(transaccionActualizada);
    }

    // Actualizacion parcial de campos del ingreso
    const updateData: any = {};

    if ("fecha" in body) updateData.fecha = body.fecha;
    if ("monto" in body) updateData.monto = body.monto;
    if ("moneda" in body) updateData.moneda = body.moneda;
    if ("cotizacionDolar" in body)
      updateData.cotizacionDolar = body.cotizacionDolar;
    if ("descripcion" in body) updateData.descripcion = body.descripcion;
    if ("tipoOperacionId" in body)
      updateData.tipoOperacionId = body.tipoOperacionId;
    if ("gastosBancarios" in body)
      updateData.gastosBancarios = body.gastosBancarios;
    if ("gastosArba" in body) updateData.gastosArba = body.gastosArba;
    if ("chequeId" in body) updateData.chequeId = body.chequeId;

    // Si se cambia la orden, actualizar clienteId desde el auto owner
    if ("ordenReparacionId" in body) {
      updateData.ordenReparacionId = body.ordenReparacionId;
      const orden = await prisma.ordenReparacion.findUnique({
        where: { id: body.ordenReparacionId },
        include: { auto: { select: { ownerId: true } } },
      });
      if (orden?.auto?.ownerId) {
        updateData.clienteId = orden.auto.ownerId;
      }
    }

    // Si se cambia la fecha, actualizar dolarId
    if (updateData.fecha) {
      const dolar = await prisma.dolar.findFirst({
        where: { fecha: { lte: new Date(updateData.fecha) } },
        orderBy: { fecha: "desc" },
      });
      updateData.dolarId = dolar?.id ?? null;
    }

    const ingresoActualizado = await prisma.ingresoPorReparacion.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        ordenReparacion: {
          include: ordenFullInclude,
        },
        cheque: chequeQueryData,
        tipoOperacion: true,
      },
    });

    // Enriquecer datos de la orden
    const result: any = returnModelWithChequeData(ingresoActualizado);
    if (ingresoActualizado.ordenReparacion) {
      const calculo = ComprobanteCalculadoFactory.fromOrden(
        ingresoActualizado.ordenReparacion
      );
      result.ordenReparacion = {
        ...ingresoActualizado.ordenReparacion,
        totalBase: calculo.totalBase,
        totalAPagar: calculo.total,
        totalPagado: calculo.totalPagado,
        deuda: calculo.deuda,
        totalRepuestos: calculo.totalRepuestos,
        totalTerceros: calculo.totalTerceros,
        totalManoDeObra: calculo.totalManoDeObra,
        ajustesConMontoEfectivo: calculo.ajustesConMontoEfectivo,
        otrosPagos: ingresoActualizado.ordenReparacion.ingresos
          .filter((i) => i.id !== id)
          .map((i) => ({
            id: i.id,
            fecha: i.fecha,
            monto: i.monto,
            moneda: i.moneda,
            tipoOperacion: i.tipoOperacion?.label || "N/A",
          })),
      };
    }

    return NextResponse.json(result);
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

    const ingreso = await prisma.ingresoPorReparacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        ordenReparacion: {
          include: ordenFullInclude,
        },
        tipoOperacion: true,
        cheque: chequeQueryData,
      },
    });

    if (!ingreso) {
      return NextResponse.json(
        { error: "Ingreso por reparacion no encontrado" },
        { status: 404 }
      );
    }

    // Calcular datos de la orden
    let ordenCalculada = null;
    if (ingreso.ordenReparacion) {
      const calculo = ComprobanteCalculadoFactory.fromOrden(
        ingreso.ordenReparacion
      );
      ordenCalculada = {
        ...ingreso.ordenReparacion,
        totalBase: calculo.totalBase,
        totalAPagar: calculo.total,
        totalPagado: calculo.totalPagado,
        deuda: calculo.deuda,
        totalRepuestos: calculo.totalRepuestos,
        totalTerceros: calculo.totalTerceros,
        totalManoDeObra: calculo.totalManoDeObra,
        ajustesConMontoEfectivo: calculo.ajustesConMontoEfectivo,
        otrosPagos: ingreso.ordenReparacion.ingresos
          .filter((i) => i.id !== ingreso.id)
          .map((i) => ({
            id: i.id,
            fecha: i.fecha,
            monto: i.monto,
            moneda: i.moneda,
            tipoOperacion: i.tipoOperacion?.label || "N/A",
          })),
      };
    }

    const result = returnModelWithChequeData(ingreso);
    return NextResponse.json({
      ...result,
      ordenReparacion: ordenCalculada,
    });
  } catch (error) {
    console.error("Error al obtener ingreso por reparacion:", error);
    return NextResponse.json(
      { error: "Error al obtener el ingreso por reparacion" },
      { status: 500 }
    );
  }
}
