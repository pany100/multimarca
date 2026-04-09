import type { AddRepuestoUsadoDto } from "@/core/application/dto/orden-reparacion.dto";
import { StockManagerService } from "@/core/application/services/stock-manager.service";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type {
  AddRepuestoUsadoData,
  RepuestoUsadoRepository,
} from "@/core/domain/repositories/repuesto-usado.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";

export class AddRepuestoUsadoUseCase {
  constructor(
    private readonly repo: RepuestoUsadoRepository,
    private readonly uow: UnitOfWork,
    private readonly stockManager: StockManagerService,
    private readonly inventory: InventoryPort
  ) {}

  async execute(input: AddRepuestoUsadoDto) {
    // Validate that exactly one parent ID is provided
    const parentIds = [
      input.ordenReparacionId,
      input.ventaId,
      input.presupuestoId,
    ].filter((id) => id !== undefined && id !== null);

    if (parentIds.length !== 1) {
      throw new Error(
        "Debe proporcionar exactamente uno de: ordenReparacionId, ventaId, o presupuestoId"
      );
    }

    // Si es un presupuesto, no validar ni consumir stock
    const isPresupuesto = input.presupuestoId !== undefined && input.presupuestoId !== null;

    if (isPresupuesto) {
      // Para presupuestos, solo agregar el repuesto sin afectar stock
      return this.uow.run(async (deps) => {
        const addData: AddRepuestoUsadoData = {
            ordenReparacionId: input.ordenReparacionId,
            ventaId: input.ventaId,
            presupuestoId: input.presupuestoId,
            stockId: input.stockId,
            precioCompra: input.precioCompra,
            precioVenta: input.precioVenta,
            unidadesConsumidas: input.unidadesConsumidas,
            ocultoParaCliente: input.ocultoParaCliente,
        iva: input.iva ?? null,
        buyIva: input.buyIva ?? null,
        markup: input.markup ?? null,
          };
      const result = await this.repo.add(addData, deps);

        return result;
      });
    }

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
      const addData: AddRepuestoUsadoData = {
        ordenReparacionId: input.ordenReparacionId,
        ventaId: input.ventaId,
        presupuestoId: input.presupuestoId,
        stockId: input.stockId,
        precioCompra: input.precioCompra,
        precioVenta: input.precioVenta,
        unidadesConsumidas: input.unidadesConsumidas,
        ocultoParaCliente: input.ocultoParaCliente,
        iva: input.iva ?? null,
        buyIva: input.buyIva ?? null,
        markup: input.markup ?? null,
      };
      const result = await this.repo.add(addData, deps);

      // Consume stock and notify
      await this.inventory.consumeAndNotify(stockActions, deps);

      return result;
    });
  }
}
