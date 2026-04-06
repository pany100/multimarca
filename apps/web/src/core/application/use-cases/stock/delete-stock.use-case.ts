import { StockRepository } from "@/core/domain/repositories/stock.repository";

export class DeleteStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
    return { message: "Stock eliminado con éxito" };
  }
}
