import { UpdateStockPricesByProveedorDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";

export class UpdateStockPricesByProveedorUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(dto: UpdateStockPricesByProveedorDto) {
    await this.repo.updatePricesByProveedor(dto);
    return { message: "Precios actualizados con éxito" };
  }
}

