export class EstadisticasMonedaVO {
  constructor(
    public readonly moneda: string | undefined,
    public readonly from: Date | null = null,
    public readonly to: Date | null = null
  ) {}
}
