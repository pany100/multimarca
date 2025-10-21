// src/core/domain/services/comprobante-calculado.factory.ts

import { PrecioDto } from "@/core/infrastructure/validation/schemas/precio.schema";
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

  static fromPrecioDto(dto: PrecioDto) {
    const priceAdjustments = PriceAdjustments.normalizeFromDB({
      descuento: dto.descuento ? new Decimal(dto.descuento) : new Decimal(0),
      incremento: dto.incremento ? new Decimal(dto.incremento) : new Decimal(0),
      incrementoInterno: dto.incrementoInterno
        ? new Decimal(dto.incrementoInterno)
        : new Decimal(0),
      porcentajeRecargo: dto.porcentajeRecargo
        ? new Decimal(dto.porcentajeRecargo)
        : new Decimal(0),
    });

    const repuestos = (dto.repuestosUsados ?? []).map((r) =>
      RepuestoUsado.fromOrderDb({
        stock: { id: r.stock.id, name: r.stock.name || "" },
        unidadesConsumidas: r.unidadesConsumidas,
        precioCompra: r.precioCompra || 0,
        precioVenta: r.precioVenta || 0,
      })
    );

    const trabajos = (dto.trabajosRealizados ?? []).map((t) =>
      TrabajoRealizado.fromOrderDb({
        precioUnitario: new Decimal(t.precioUnitario),
        descripcion: t.descripcion || t.manoDeObra?.name || "",
        diasParaRecordatorio: t.diasParaRecordatorio || null,
      })
    );

    const terceros = (dto.reparacionesDeTercero ?? []).map((t) =>
      ReparacionTercero.fromOrderDb({
        nombre: t.nombre,
        precioCompra: new Decimal(t.precioCompra || 0),
        precioVenta: new Decimal(t.precioVenta || 0),
      })
    );

    // No payments for price calculation
    const pagos: Pago[] = [];

    return new ComprobanteCalculado(
      repuestos,
      terceros,
      trabajos,
      pagos,
      priceAdjustments
    );
  }
}
