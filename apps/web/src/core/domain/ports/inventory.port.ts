import { StockAction } from "../value-objects/stock-action.vo";

export interface InventoryPort {
  ensureSufficient(
    stockActions: StockAction[],
    deps?: { tx?: any }
  ): Promise<void>;
  consumeAndNotify(
    stockActions: StockAction[],
    deps?: { tx?: any }
  ): Promise<void>;
  restoreStock(stockActions: StockAction[], deps?: { tx?: any }): Promise<void>;
}
