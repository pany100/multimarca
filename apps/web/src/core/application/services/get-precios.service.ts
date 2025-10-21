import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { PrecioDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetPreciosService {
  constructor() {}

  async getPreciosForOrden(dto: PrecioDto) {
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromPrecioDto(dto);
    return {
      totalAPagar: comprobanteCalculado.total,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalTerceros: comprobanteCalculado.totalTerceros,
      totalPagado: comprobanteCalculado.totalPagado,
      deuda: comprobanteCalculado.deuda,
    };
  }
}
