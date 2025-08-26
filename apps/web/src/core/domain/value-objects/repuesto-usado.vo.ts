import { Money } from "./money.vo";

export interface RepuestoUsadoProps {
  stockId: number;
  unidadesConsumidas: number;
  precioCompra?: number;
  precioVenta?: number;
  stockName?: string;
}

export class RepuestoUsado {
  constructor(
    public readonly stockId: number,
    public readonly unidadesConsumidas: number,
    public readonly precioCompra: Money,
    public readonly precioVenta: Money,
    public readonly stockName?: string
  ) {
    if (!Number.isInteger(unidadesConsumidas) || unidadesConsumidas <= 0) {
      throw new Error("Unidades consumidas inválidas");
    }
  }

  static from(p: RepuestoUsadoProps) {
    return new RepuestoUsado(
      Number(p.stockId),
      Number(p.unidadesConsumidas),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.stockName
    );
  }
}
