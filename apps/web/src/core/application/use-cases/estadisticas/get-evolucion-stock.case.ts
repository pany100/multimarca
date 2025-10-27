import { EstadisticasEvolucionStockService } from "@/core/infrastructure/database/queries/estadisticas-evolucion-stock.service";

export class GetEvolucionStockUseCase {
  constructor(private readonly service: EstadisticasEvolucionStockService) {}

  async execute() {
    const evolucionStock = await this.service.getEvolucionStock();
    
    if (!Array.isArray(evolucionStock) || evolucionStock.length === 0) {
      throw new Error("No se encontraron datos de evolución de stock");
    }

    const data = evolucionStock[0];

    return {
      costoStock: Number(data.costoStock || 0),
      plataEnStock: Number(data.plataEnStock || 0),
    };
  }
}
