import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { PrecioFinalReparacionesDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetTotalReparacionesService {
  constructor() {}

  async getTotalReparaciones(dto: PrecioFinalReparacionesDto) {
    // Crear un comprobante calculado solo con las reparaciones de terceros
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromPrecioDto({
      reparacionesDeTercero: dto.reparacionesTerceros,
      porcentajeRecargo: dto.porcentajeRecargo || 0,
      repuestosUsados: [],
      trabajosRealizados: [],
      descuento: 0,
      incremento: 0,
      incrementoInterno: 0,
    });

    return {
      totalTerceros: comprobanteCalculado.totalTerceros,
    };
  }
}
