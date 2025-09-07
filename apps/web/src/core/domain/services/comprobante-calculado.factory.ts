// src/core/domain/services/comprobante-calculado.factory.ts

import { OrdenReparacionWithRelationsForClient } from "../repositories/orden-reparacion.repository";
import { Pago } from "../value-objects/pago.vo";
import { PriceAdjustments } from "../value-objects/price-adjustments.vo";
import { ReparacionTercero } from "../value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "../value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "../value-objects/trabajo-realizado.vo";
import { ComprobanteCalculado } from "./comprobante-calculado.service";

export class ComprobanteCalculadoFactory {
  static fromOrden(orden: OrdenReparacionWithRelationsForClient) {
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
