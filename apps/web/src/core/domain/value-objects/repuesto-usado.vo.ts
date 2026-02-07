import { RepuestoFromOrderInDb } from "../repositories/orden-reparacion.repository";
import { Money } from "./money.vo";

export interface RepuestoUsadoProps {
  stockId: number;
  unidadesConsumidas: number;
  precioCompra?: number;
  precioVenta?: number;
  stockName?: string;
}

export interface RepuestoUsadoHTTPInput {
  stock: {
    id: number;
    name?: string | undefined;
  };
  unidadesConsumidas: number;
  precioCompra?: number | undefined;
  precioVenta?: number | undefined;
}

export class RepuestoUsado {
  constructor(
    public readonly stockId: number,
    public readonly unidadesConsumidas: number,
    public readonly precioCompra: Money,
    public readonly precioVenta: Money,
    public readonly stockName?: string
  ) {
    const u = Number(unidadesConsumidas);
    if (!Number.isFinite(u) || u <= 0) {
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

  static fromHttpInput(p: RepuestoUsadoHTTPInput) {
    return new RepuestoUsado(
      Number(p.stock.id),
      Number(p.unidadesConsumidas),
      Money.from(p.precioCompra),
      Money.from(p.precioVenta),
      p.stock.name
    );
  }

  static fromOrderDb(r: RepuestoFromOrderInDb) {
    return new RepuestoUsado(
      Number(r.stock.id),
      Number(r.unidadesConsumidas),
      Money.from(r.precioCompra),
      Money.from(r.precioVenta),
      r.stock.name
    );
  }
}
