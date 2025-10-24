import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { MecanicoRef } from "@/core/domain/value-objects/mecanico-ref.vo";
import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
import { PriceAdjustments } from "@/core/domain/value-objects/price-adjustments.vo";
import { ReparacionTercero } from "@/core/domain/value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "@/core/domain/value-objects/trabajo-realizado.vo";
import { PrismaControlMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-control-mecanico.repository";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";
import { CreateOrdenDto, UpdateOrdenDto } from "../dto/orden-reparacion.dto";

export interface OrdenReparacionCreateData {
  data: Prisma.OrdenReparacionUncheckedCreateInput;
  include: Prisma.OrdenReparacionInclude;
}

export interface OrdenReparacionUpdateData {
  data: Prisma.OrdenReparacionUncheckedUpdateInput;
  include: Prisma.OrdenReparacionInclude;
  where: Prisma.OrdenReparacionWhereUniqueInput;
}

export interface TransformedOrdenData {
  priceAdjustments: PriceAdjustments;
  mecanicos: MecanicoRef[];
  repuestos: RepuestoUsado[];
  trabajos: TrabajoRealizado[];
  terceros: ReparacionTercero[];
  estado: EstadoOrden;
}

export class OrdenReparacionVOMapper {
  private static async transformInput(
    input: CreateOrdenDto
  ): Promise<TransformedOrdenData> {
    // Ajustes de precio
    const priceAdjustments = PriceAdjustments.normalizeFromHttp(input);

    // Mapear VOs
    const mecanicos = (input.mecanicos ?? []).map(MecanicoRef.from);

    const repuestos = (input.repuestosUsados ?? []).map(
      RepuestoUsado.fromHttpInput
    );

    const trabajos = (input.trabajosRealizados ?? []).map(
      TrabajoRealizado.fromHttpInput
    );

    const terceros = (input.reparacionesDeTercero ?? []).map((t) =>
      ReparacionTercero.fromHttpInput(t)
    );

    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Presupuestado
    );

    return {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      estado,
    };
  }

  static async transformInputToVO(
    input: CreateOrdenDto
  ): Promise<OrdenReparacionVO> {
    // Transform to individual VOs first
    const exchange = new DolarExchangeAdapter();
    const controlMecanico = new PrismaControlMecanicoRepository();
    const {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      estado,
    } = await this.transformInput(input);
    const fechaSalidaReparacion = input.fechaSalidaReparacion
      ? new Date(input.fechaSalidaReparacion)
      : new Date();
    const dolar = await exchange.getForDate(fechaSalidaReparacion);

    const controles = await controlMecanico.findMany();
    return OrdenReparacionVO.from({
      priceAdjustmentsVO: priceAdjustments,
      mecanicosVO: mecanicos,
      repuestosVO: repuestos,
      trabajosVO: trabajos,
      tercerosVO: terceros,
      autoId: input.autoId,
      fechaEntradaReparacion: input.fechaEntradaReparacion,
      fechaSalidaReparacion: input.fechaSalidaReparacion,
      fechaCreacion: input.fechaCreacion,
      kilometros: input.kilometros,
      observacionesCliente: input.observacionesCliente,
      observacionesEntrada: input.observacionesEntrada,
      observacionesSalida: input.observacionesSalida,
      observacionesOcultas: input.observacionesOcultas,
      estado,
      controlesEnReparacion: controles,
      pdfPath: input.pdfPath,
      descuento: input.descuento,
      descripcionDescuento: input.descripcionDescuento,
      incremento: input.incremento,
      descripcionIncremento: input.descripcionIncremento,
      incrementoInterno: input.incrementoInterno,
      porcentajeRecargo: input.porcentajeRecargo,
      dolarId: dolar?.id,
    });
  }

  static async transformUpdateInputToVO(
    input: UpdateOrdenDto
  ): Promise<OrdenReparacionVO> {
    const exchange = new DolarExchangeAdapter();
    const {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      estado,
    } = await this.transformInput(input);
    const fechaSalida = input.fechaSalidaReparacion
      ? new Date(input.fechaSalidaReparacion)
      : new Date();
    const dolar = await exchange.getForDate(fechaSalida);

    return OrdenReparacionVO.from({
      id: input.id,
      priceAdjustmentsVO: priceAdjustments,
      mecanicosVO: mecanicos,
      repuestosVO: repuestos,
      trabajosVO: trabajos,
      tercerosVO: terceros,
      autoId: input.autoId,
      fechaEntradaReparacion: input.fechaEntradaReparacion,
      fechaSalidaReparacion: input.fechaSalidaReparacion,
      fechaCreacion: input.fechaCreacion,
      kilometros: input.kilometros,
      observacionesCliente: input.observacionesCliente,
      observacionesEntrada: input.observacionesEntrada,
      observacionesSalida: input.observacionesSalida,
      observacionesOcultas: input.observacionesOcultas,
      estado,
      recibos: input.recibos,
      revisadoPorId: input.revisadoPorId,
      pdfPath: input.pdfPath,
      descuento: input.descuento,
      descripcionDescuento: input.descripcionDescuento,
      incremento: input.incremento,
      descripcionIncremento: input.descripcionIncremento,
      incrementoInterno: input.incrementoInterno,
      porcentajeRecargo: input.porcentajeRecargo,
      dolarId: dolar?.id,
      controlesEnReparacion: input.controlesEnReparacion,
      detalleControles: input.detalleControles,
    });
  }
}
