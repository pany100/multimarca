export enum StockActionType {
  TAKE = "TAKE",
  RELEASE = "RELEASE",
  ADD = "ADD",
}

export class StockAction {
  constructor(
    public readonly stockId: number,
    public readonly cantidad: number,
    public readonly accion: StockActionType
  ) {}

  static take(stockId: number, cantidad: number): StockAction {
    return new StockAction(stockId, cantidad, StockActionType.TAKE);
  }

  static release(stockId: number, cantidad: number): StockAction {
    return new StockAction(stockId, cantidad, StockActionType.RELEASE);
  }

  static add(stockId: number, cantidad: number): StockAction {
    return new StockAction(stockId, cantidad, StockActionType.ADD);
  }
}
