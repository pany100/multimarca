import type { DeleteRepuestoUsadoDto } from "@/core/application/dto/orden-reparacion.dto";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";

export class DeleteRepuestoUsadoUseCase {
  constructor(
    private readonly repo: RepuestoUsadoRepository,
    private readonly uow: UnitOfWork,
    private readonly stockManager: StockManagerService,
    private readonly inventory: InventoryPort
  ) {}

  async execute(input: DeleteRepuestoUsadoDto) {
    const existing = await this.repo.findById(input.id);
    if (!existing) throw new Error("Repuesto usado no encontrado");

    const repuestoVO = RepuestoUsado.from({
      stockId: existing.stockId,
      unidadesConsumidas: existing.unidadesConsumidas,
      precioCompra: existing.precioCompra,
      precioVenta: existing.precioVenta,
    });

    const stockActions = this.stockManager.generateReleaseActions([repuestoVO]);

    return this.uow.run(async (deps) => {
      await this.repo.delete(input.id, deps);
      await this.inventory.restoreStock(stockActions, deps);
      return stockActions;
    });
  }
}
