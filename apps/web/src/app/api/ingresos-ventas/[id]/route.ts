import { TransaccionService } from "@/core/application/services/transaccion.service";
import { UpdateRevisadoUseCase } from "@/core/application/use-cases/transacciones/update-revisado.use-case";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
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
        cotizacionDolar,
        gastosBancarios,
        gastosArba,
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
        new TransaccionService(new PrismaIngresoVentaRepository())
      ).execute(dto);

      return NextResponse.json(transaccionActualizada);
    }

    // Actualización parcial de campos del ingreso
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

    // Si se cambia la venta, actualizar clienteId/informacionCliente
    if ("ventaId" in body) {
      updateData.ventaId = body.ventaId;
      const venta = await prisma.venta.findUnique({
        where: { id: body.ventaId },
        select: { clienteId: true, informacionCliente: true },
      });
      if (venta) {
        updateData.clienteId = venta.clienteId;
        updateData.informacionCliente = venta.informacionCliente;
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

    const ingresoActualizado = await prisma.ingresoPorVenta.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        venta: {
          include: {
            repuestosUsados: { include: { stock: true } },
            reparacionesDeTercero: {
              include: { proveedor: true, reciboFile: true },
            },
            trabajosRealizados: true,
            ingresos: {
              include: { dolar: true, tipoOperacion: true },
            },
            ajustesPrecio: true,
            cliente: true,
          },
        },
        cheque: chequeQueryData,
        tipoOperacion: true,
      },
    });

    // Enriquecer datos de la venta
    const result: any = returnModelWithChequeData(ingresoActualizado);
    if (ingresoActualizado.venta) {
      const calculo = ComprobanteCalculadoFactory.fromVenta(
        ingresoActualizado.venta
      );
      result.venta = {
        ...ingresoActualizado.venta,
        totalAPagar: calculo.total,
        totalPagado: calculo.totalPagado,
        deuda: calculo.deuda,
        totalRepuestos: calculo.totalRepuestos,
        totalTerceros: calculo.totalTerceros,
        totalManoDeObra: calculo.totalManoDeObra,
        otrosPagos: ingresoActualizado.venta.ingresos
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
        venta: {
          include: {
            repuestosUsados: { include: { stock: true } },
            reparacionesDeTercero: {
              include: { proveedor: true, reciboFile: true },
            },
            trabajosRealizados: true,
            ingresos: {
              include: { dolar: true, tipoOperacion: true },
            },
            ajustesPrecio: true,
            cliente: true,
          },
        },
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

    // Calcular datos de la venta
    let ventaCalculada = null;
    if (ingreso.venta) {
      const calculo = ComprobanteCalculadoFactory.fromVenta(ingreso.venta);
      ventaCalculada = {
        ...ingreso.venta,
        totalAPagar: calculo.total,
        totalPagado: calculo.totalPagado,
        deuda: calculo.deuda,
        totalRepuestos: calculo.totalRepuestos,
        totalTerceros: calculo.totalTerceros,
        totalManoDeObra: calculo.totalManoDeObra,
        otrosPagos: ingreso.venta.ingresos
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
      venta: ventaCalculada,
    });
  } catch (error) {
    console.error("Error al obtener ingreso por venta:", error);
    return NextResponse.json(
      { error: "Error al obtener el ingreso por venta" },
      { status: 500 }
    );
  }
}
