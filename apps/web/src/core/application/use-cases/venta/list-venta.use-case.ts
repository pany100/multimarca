import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { normalizePageSize } from "@/shared/utils/pagination";
import { ListVentasQueryDto } from "../../dto/venta.dto";

export class ListVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(params: ListVentasQueryDto) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    const result = await this.repo.listPaged({
      ...params,
      query: params.query ?? "",
      page,
      size,
    });
    const items = result.items.map((venta) => {
      const comprobante = ComprobanteCalculadoFactory.fromVenta(venta);
      return {
        ...venta,
        precioTotal: comprobante.total,
        totalPagado: comprobante.totalPagado,
      };
    });
    return {
      ...result,
      items,
    };
  }
}
