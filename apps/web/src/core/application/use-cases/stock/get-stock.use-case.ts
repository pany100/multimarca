import { StockRepository } from "@/core/domain/repositories/stock.repository";

export class GetStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(id: number) {
    const stock = await this.repo.findById(id);
    if (!stock) throw new Error("Stock no encontrado");
    return stock;
  }
}
