import { Prisma } from "@prisma/client";

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

  static normalizeFromDB(input: {
    descuento: number | Prisma.Decimal;
    incremento: number | Prisma.Decimal;
    incrementoInterno: number | Prisma.Decimal;
    porcentajeRecargo: number | Prisma.Decimal;
  }) {
    return new PriceAdjustments(
      Number(input.descuento),
      Number(input.incremento),
      Number(input.incrementoInterno),
      Number(input.porcentajeRecargo)
    );
  }

  static normalizeFromHttp(input: Partial<PriceAdjustments>) {
    const num = (n?: number) => (typeof n === "number" ? n : 0);
    return new PriceAdjustments(
      num(input.descuento),
      num(input.incremento),
      num(input.incrementoInterno),
      num(input.porcentajeRecargo)
    );
  }

  applyTo(precio: number) {
    return precio + this.incrementoInterno - this.descuento + this.incremento;
  }

  applyToWithoutDiscount(precio: number) {
    return precio + this.incrementoInterno + this.incremento;
  }
}
