import { EstadisticasBaseVO } from "./estadisticas-base.vo";

export class EstadisticasBalanceVO {
  constructor(
    public readonly baseVO: EstadisticasBaseVO,
    public readonly moneda: string | undefined
  ) {}
}
