import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { MecanicoRef } from "@/core/domain/value-objects/mecanico-ref.vo";
import { PresupuestoVO } from "@/core/domain/value-objects/presupuesto.vo";
import { PriceAdjustments } from "@/core/domain/value-objects/price-adjustments.vo";
import { ReparacionTercero } from "@/core/domain/value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { TareasAdministrativasVO } from "@/core/domain/value-objects/tareas-administrativas.vo";
import { TrabajoRealizado } from "@/core/domain/value-objects/trabajo-realizado.vo";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { EstadoPresupuesto, Prisma } from "@prisma/client";
import {
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
} from "../dto/presupuesto.dto";

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

export class PresupuestoVOMapper {
  static async transformInputToVO(
    input: CreatePresupuestoDto | UpdatePresupuestoDto
  ): Promise<PresupuestoVO> {
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

    const tareasAdministrativas = (input.tareasAdministrativas ?? []).map(
      TareasAdministrativasVO.from
    );
    const exchange = new DolarExchangeAdapter();
    const fecha = input.fecha ? new Date(input.fecha) : new Date();
    const dolar = await exchange.getForDate(fecha);
    const id = (input as UpdatePresupuestoDto).id || null;
    return PresupuestoVO.from({
      id,
      priceAdjustmentsVO: priceAdjustments,
      repuestosVO: repuestos,
      trabajosVO: trabajos,
      tercerosVO: terceros,
      autoId: input.autoId,
      fecha,
      fechaRespuesta: input.fechaRespuesta || null,
      fechaEnvio: input.fechaEnvio || null,
      observacionesCliente: input.observacionesCliente,
      detallesDeTrabajo: input.detallesDeTrabajo,
      informacionAuto: input.informacionAuto,
      informacionCliente: input.informacionCliente,
      estado: input.estado || EstadoPresupuesto.EnPreparacion,
      dolarId: dolar?.id,
      descuento: input.descuento,
      descripcionDescuento: input.descripcionDescuento,
      incremento: input.incremento,
      descripcionIncremento: input.descripcionIncremento,
      incrementoInterno: input.incrementoInterno,
      porcentajeRecargo: input.porcentajeRecargo,
      tareasAdministrativas: tareasAdministrativas,
    });
  }
}
