// src/core/domain/value-objects/venta.vo.ts

import { EstadoVenta } from "@prisma/client";
import { PriceAdjustments } from "./price-adjustments.vo";
import { ReparacionTercero } from "./reparacion-tercero.vo";
import { RepuestoUsado } from "./repuesto-usado.vo";
import { TrabajoRealizado } from "./trabajo-realizado.vo";

export type VentaProps = {
  id?: number | null;
  clienteId?: number | null;
  informacionCliente?: string | null;
  fecha: Date;

  estado: EstadoVenta;

  descripcionDescuento?: string | null;
  descripcionIncremento?: string | null;

  priceAdjustmentsVO: PriceAdjustments;
  repuestosVO: RepuestoUsado[];
  trabajosVO: TrabajoRealizado[];
  tercerosVO: ReparacionTercero[];

  dolarId?: number | null;
};

export class VentaVO {
  constructor(
    public readonly id: number | null,
    public readonly clienteId: number | null,
    public readonly informacionCliente: string | null,
    public readonly fecha: Date,
    public readonly estado: EstadoVenta,
    public readonly descripcionDescuento: string | null = null,
    public readonly descripcionIncremento: string | null = null,
    public readonly priceAdjustmentsVO: PriceAdjustments,
    public readonly repuestosVO: RepuestoUsado[],
    public readonly trabajosVO: TrabajoRealizado[],
    public readonly tercerosVO: ReparacionTercero[],

    public readonly dolarId: number | null = null
  ) {}

  static from(props: VentaProps): VentaVO {
    return new VentaVO(
      props.id ?? null,
      props.clienteId ?? null,
      props.informacionCliente ?? null,
      props.fecha,
      props.estado,
      props.descripcionDescuento,
      props.descripcionIncremento,
      props.priceAdjustmentsVO,
      props.repuestosVO,
      props.trabajosVO,
      props.tercerosVO,
      props.dolarId ?? null
    );
  }
}
