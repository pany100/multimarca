import type { UpdateRepuestoUsadoDto } from "@/core/application/dto/orden-reparacion.dto";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { prisma } from "@/core/infrastructure/database/prisma";

export class UpdateRepuestoUsadoUseCase {
  constructor(
    private readonly repo: RepuestoUsadoRepository,
    private readonly uow: UnitOfWork,
    private readonly stockManager: StockManagerService,
    private readonly inventory: InventoryPort
  ) {}

  async execute(input: UpdateRepuestoUsadoDto) {
    // Get existing repuesto to compare
    const existing = await prisma.repuestoUsado.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new Error("Repuesto usado no encontrado");
    }

    // Si es un presupuesto, no validar ni sincronizar stock
    const isPresupuesto = existing.presupuestoId !== null;

    if (isPresupuesto) {
      // Para presupuestos, solo actualizar el repuesto sin afectar stock
      return this.uow.run(async (deps) => {
        const result = await this.repo.update(
          input.id,
          {
            stockId: input.stockId,
            precioCompra: input.precioCompra,
            precioVenta: input.precioVenta,
            unidadesConsumidas: input.unidadesConsumidas,
          },
          deps
        );

        return result;
      });
    }

    // Create VOs for stock validation
    const existingVO = RepuestoUsado.from({
      stockId: existing.stockId,
      unidadesConsumidas: Number(existing.unidadesConsumidas),
      precioCompra: Number(existing.precioCompra),
      precioVenta: Number(existing.precioVenta),
    });

    const newVO = RepuestoUsado.from({
      stockId: input.stockId ?? existing.stockId,
      unidadesConsumidas:
        input.unidadesConsumidas ?? Number(existing.unidadesConsumidas),
      precioCompra: input.precioCompra ?? Number(existing.precioCompra),
      precioVenta: input.precioVenta ?? Number(existing.precioVenta),
    });

    // Generate sync actions and validate availability
    const stockActions = this.stockManager.generateSyncActions(
      [existingVO],
      [newVO]
    );
    await this.inventory.ensureSufficient(stockActions);

    return this.uow.run(async (deps) => {
      // Update repuesto in database
      const result = await this.repo.update(
        input.id,
        {
          stockId: input.stockId,
          precioCompra: input.precioCompra,
          precioVenta: input.precioVenta,
          unidadesConsumidas: input.unidadesConsumidas,
        },
        deps
      );

      // Sync stock and notify
      await this.inventory.syncStockAndNotify(stockActions, deps);

      return result;
    });
  }
}
