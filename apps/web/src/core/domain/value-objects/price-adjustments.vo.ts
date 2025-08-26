export class PriceAdjustments {
  private constructor(
    public readonly descuento: number,
    public readonly incremento: number,
    public readonly incrementoInterno: number,
    public readonly porcentajeRecargo: number
  ) {}

  static normalize(input: Partial<PriceAdjustments>) {
    const num = (n?: number) => (typeof n === "number" ? n : 0);
    return new PriceAdjustments(
      num(input.descuento),
      num(input.incremento),
      num(input.incrementoInterno),
      num(input.porcentajeRecargo)
    );
  }
}
