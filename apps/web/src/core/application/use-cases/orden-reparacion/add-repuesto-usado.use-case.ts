import type { AddRepuestoUsadoDto } from "@/core/application/dto/orden-reparacion.dto";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";

export class AddRepuestoUsadoUseCase {
  constructor(
    private readonly repo: RepuestoUsadoRepository,
    private readonly uow: UnitOfWork,
    private readonly stockManager: StockManagerService,
    private readonly inventory: InventoryPort
  ) {}

  async execute(input: AddRepuestoUsadoDto) {
    // Create RepuestoUsado VO for stock validation
    const repuestoVO = RepuestoUsado.from({
      stockId: input.stockId,
      unidadesConsumidas: input.unidadesConsumidas,
      precioCompra: input.precioCompra,
      precioVenta: input.precioVenta,
    });

    // Generate stock actions and validate availability
    const stockActions = this.stockManager.generateTakeActions([repuestoVO]);
    await this.inventory.ensureSufficient(stockActions);

    return this.uow.run(async (deps) => {
      // Add repuesto to database
      const result = await this.repo.add(
        {
          ordenReparacionId: input.ordenReparacionId,
          stockId: input.stockId,
          precioCompra: input.precioCompra,
          precioVenta: input.precioVenta,
          unidadesConsumidas: input.unidadesConsumidas,
        },
        deps
      );

      // Consume stock and notify
      await this.inventory.consumeAndNotify(stockActions, deps);

      return result;
    });
  }
}
