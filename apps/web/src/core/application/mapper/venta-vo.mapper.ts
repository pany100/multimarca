import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { MecanicoRef } from "@/core/domain/value-objects/mecanico-ref.vo";
import { PriceAdjustments } from "@/core/domain/value-objects/price-adjustments.vo";
import { ReparacionTercero } from "@/core/domain/value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "@/core/domain/value-objects/trabajo-realizado.vo";
import { VentaVO } from "@/core/domain/value-objects/venta.vo";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { Prisma } from "@prisma/client";
import { CreateVentaDto, UpdateVentaDto } from "../dto/venta.dto";

export interface PresupuestoCreateData {
  data: Prisma.PresupuestoUncheckedCreateInput;
  include: Prisma.PresupuestoInclude;
}

export interface PresupuestoUpdateData {
  data: Prisma.PresupuestoUncheckedUpdateInput;
  include: Prisma.PresupuestoInclude;
  where: Prisma.PresupuestoWhereUniqueInput;
}

export interface TransformedPresupuestoData {
  priceAdjustments: PriceAdjustments;
  mecanicos: MecanicoRef[];
  repuestos: RepuestoUsado[];
  trabajos: TrabajoRealizado[];
  terceros: ReparacionTercero[];
  estado: EstadoOrden;
}

export class VentaVOMapper {
  static async transformInputToVO(
    input: CreateVentaDto | UpdateVentaDto
  ): Promise<VentaVO> {
    const priceAdjustments = PriceAdjustments.normalizeFromHttp(input);

    const repuestos = (input.repuestosUsados ?? []).map(
      RepuestoUsado.fromHttpInput
    );

    const trabajos = (input.trabajosRealizados ?? []).map(
      TrabajoRealizado.fromHttpInput
    );

    const terceros = (input.reparacionesDeTercero ?? []).map((t) =>
      ReparacionTercero.fromHttpInput(t)
    );

    const exchange = new DolarExchangeAdapter();
    const fecha = input.fecha ? new Date(input.fecha) : new Date();
    const dolar = await exchange.getForDate(fecha);
    const id = (input as UpdateVentaDto).id || null;

    return VentaVO.from({
      id,
      priceAdjustmentsVO: priceAdjustments,
      repuestosVO: repuestos,
      trabajosVO: trabajos,
      tercerosVO: terceros,
      clienteId: input.clienteId,
      informacionCliente: input.informacionCliente,
      fecha,
      estado: input.estado,
      dolarId: dolar?.id,
      descripcionDescuento: input.descripcionDescuento,
      descripcionIncremento: input.descripcionIncremento,
    });
  }
}
