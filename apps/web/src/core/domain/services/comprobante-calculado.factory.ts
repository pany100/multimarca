// src/core/domain/services/comprobante-calculado.factory.ts

import { Decimal } from "@prisma/client/runtime/library";
import { OrdenReparacionWithRelationsForClient } from "../repositories/orden-reparacion.repository";
import { Pago } from "../value-objects/pago.vo";
import { PriceAdjustments } from "../value-objects/price-adjustments.vo";
import { ReparacionTercero } from "../value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "../value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "../value-objects/trabajo-realizado.vo";
import { ComprobanteCalculado } from "./comprobante-calculado.service";

export type OrdenForCalculo = {
  descuento: Decimal;
  incremento: Decimal;
  incrementoInterno: Decimal;
  porcentajeRecargo: Decimal;
  repuestosUsados: OrdenReparacionWithRelationsForClient["repuestosUsados"];
  reparacionesDeTercero: OrdenReparacionWithRelationsForClient["reparacionesDeTercero"];
  trabajosRealizados: OrdenReparacionWithRelationsForClient["trabajosRealizados"];
  ingresos: OrdenReparacionWithRelationsForClient["ingresos"];
};

export class ComprobanteCalculadoFactory {
  static fromOrden(orden: OrdenForCalculo) {
    const priceAdjustments = PriceAdjustments.normalizeFromDB({
      descuento: orden.descuento,
      incremento: orden.incremento,
      incrementoInterno: orden.incrementoInterno,
      porcentajeRecargo: orden.porcentajeRecargo,
    });

    const repuestos = (orden.repuestosUsados ?? []).map(
      RepuestoUsado.fromOrderDb
    );

    const trabajos = (orden.trabajosRealizados ?? []).map(
      TrabajoRealizado.fromOrderDb
    );

    const terceros = (orden.reparacionesDeTercero ?? []).map((t) =>
      ReparacionTercero.fromOrderDb(t)
    );
    const pagos = (orden.ingresos ?? []).map((p) => Pago.fromOrderDb(p));
    return new ComprobanteCalculado(
      repuestos,
      terceros,
      trabajos,
      pagos,
      priceAdjustments
    );
  }
}
