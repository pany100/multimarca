import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { PrecioFinalRepuestosDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetTotalRepuestosService {
  constructor() {}

  async getTotalRepuestos(dto: PrecioFinalRepuestosDto) {
    // Crear un comprobante calculado solo con los repuestos
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromPrecioDto({
      repuestosUsados: dto.repuestosUsados,
      reparacionesDeTercero: [],
      trabajosRealizados: [],
      descuento: 0,
      incremento: 0,
      incrementoInterno: 0,
      porcentajeRecargo: 0,
    });

    return {
      totalRepuestos: comprobanteCalculado.totalRepuestos,
    };
  }
}
