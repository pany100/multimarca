import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { StockAction } from "@/core/domain/value-objects/stock-action.vo";

export class StockManagerService {
  /**
   * Genera acciones de stock para tomar repuestos del inventario
   * @param repuestos Lista de repuestos usados
   * @returns Lista de StockActions con acción TAKE
   */
  generateTakeActions(repuestos: RepuestoUsado[]): StockAction[] {
    return repuestos.map((repuesto) =>
      StockAction.take(repuesto.stockId, repuesto.unidadesConsumidas)
    );
  }

  /**
   * Genera acciones de stock para liberar repuestos al inventario
   * @param repuestos Lista de repuestos usados
   * @returns Lista de StockActions con acción RELEASE
   */
  generateReleaseActions(repuestos: RepuestoUsado[]): StockAction[] {
    return repuestos.map((repuesto) =>
      StockAction.release(repuesto.stockId, repuesto.unidadesConsumidas)
    );
  }

  /**
   * Genera acciones de stock para agregar repuestos al inventario
   * @param stockItems Lista de items con stockId y cantidad
   * @returns Lista de StockActions con acción ADD
   */
  generateAddActions(
    stockItems: { stockId: number; cantidad: number }[]
  ): StockAction[] {
    return stockItems.map((item) =>
      StockAction.add(item.stockId, item.cantidad)
    );
  }

  /**
   * Compara dos listas de repuestos y genera las acciones necesarias
   * @param previousRepuestos Repuestos anteriores
   * @param newRepuestos Nuevos repuestos
   * @returns Lista de StockActions para sincronizar el inventario
   */
  generateSyncActions(
    previousRepuestos: RepuestoUsado[],
    newRepuestos: RepuestoUsado[]
  ): StockAction[] {
    const actions: StockAction[] = [];

    // Liberar stock de repuestos eliminados
    const removedRepuestos = previousRepuestos.filter(
      (prev) => !newRepuestos.some((curr) => curr.stockId === prev.stockId)
    );
    actions.push(...this.generateReleaseActions(removedRepuestos));

    // Tomar stock de repuestos nuevos
    const addedRepuestos = newRepuestos.filter(
      (curr) => !previousRepuestos.some((prev) => prev.stockId === curr.stockId)
    );
    actions.push(...this.generateTakeActions(addedRepuestos));

    // Ajustar cantidades de repuestos modificados
    const modifiedRepuestos = newRepuestos.filter((curr) => {
      const prev = previousRepuestos.find((p) => p.stockId === curr.stockId);
      return prev && prev.unidadesConsumidas !== curr.unidadesConsumidas;
    });

    for (const current of modifiedRepuestos) {
      const previous = previousRepuestos.find(
        (p) => p.stockId === current.stockId
      )!;
      const difference =
        current.unidadesConsumidas - previous.unidadesConsumidas;

      if (difference > 0) {
        actions.push(StockAction.take(current.stockId, difference));
      } else {
        actions.push(
          StockAction.release(current.stockId, Math.abs(difference))
        );
      }
    }

    return actions;
  }
}
