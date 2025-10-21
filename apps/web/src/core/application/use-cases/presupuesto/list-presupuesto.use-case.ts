import { ListPresupuestosDto } from "@/core/application/dto/presupuesto.dto";
import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListPresupuestoUseCase {
  constructor(private readonly repo: PresupuestoRepository) {}

  async execute(params: ListPresupuestosDto) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    const result = await this.repo.listPaged({
      ...params,
      query: params.query ?? "",
      page,
      size,
    });
    const items = result.items.map((item) => {
      const comprobanteCalculado =
        ComprobanteCalculadoFactory.fromPresupuesto(item);
      return {
        ...item,
        totalAPagar: comprobanteCalculado.total,
      };
    });
    return {
      ...result,
      items,
    };
  }
}
