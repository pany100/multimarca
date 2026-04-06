import { StockRepository } from "@/core/domain/repositories/stock.repository";

export class ListAllStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute() {
    return await this.repo.listAll();
  }
}

