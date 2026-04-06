import { ListStockDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";
import { normalizePageSize } from "@/shared/utils/pagination";

export class ListStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(params: ListStockDto) {
    const { page, size } = normalizePageSize(params.page, params.size, {
      defaultSize: 10,
    });
    return await this.repo.listPaged({
      ...params,
      query: params.query ?? "",
      page,
      size,
    });
  }
}
