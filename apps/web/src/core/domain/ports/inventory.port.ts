export interface InventoryPort {
  ensureSufficient(
    input: Array<{ stockId: number; units: number; name?: string }>,
    deps?: { tx?: any }
  ): Promise<void>;
  consumeAndNotify(
    input: Array<{ stockId: number; units: number }>,
    deps?: { tx?: any }
  ): Promise<void>;
  restoreStock(
    input: Array<{ stockId: number; units: number }>,
    deps?: { tx?: any }
  ): Promise<void>;
}
