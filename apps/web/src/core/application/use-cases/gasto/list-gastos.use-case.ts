import { ListGastosQueryDto } from "@/core/application/dto/gasto.dto";
import { GastoRepository } from "@/core/domain/repositories/gasto.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListGastosUseCase {
  constructor(private readonly repo: GastoRepository) {}

  async execute(params: ListGastosQueryDto & { userRoleName: string }) {
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
