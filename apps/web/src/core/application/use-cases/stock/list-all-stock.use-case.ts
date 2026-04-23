import { ExportStockDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";

export class ListAllStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(params?: ExportStockDto) {
    return await this.repo.listAll(params);
  }
}
