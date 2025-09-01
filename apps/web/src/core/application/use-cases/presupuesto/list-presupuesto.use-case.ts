import { ListPresupuestosDto } from "@/core/application/dto/presupuesto.dto";
import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListPresupuestoUseCase {
  constructor(private readonly repo: PresupuestoRepository) {}

  async execute(params: ListPresupuestosDto) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    return this.repo.listPaged({
      ...params,
      query: params.query ?? "",
      page,
      size,
    });
  }
}
