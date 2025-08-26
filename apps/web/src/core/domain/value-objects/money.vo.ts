import { Prisma } from "@prisma/client";
export class Money {
  private readonly v: Prisma.Decimal;
  private constructor(v: Prisma.Decimal) {
    this.v = v;
  }
  static from(x: number | string | Prisma.Decimal | null | undefined) {
    const d = new Prisma.Decimal(x ?? 0);
    if (d.isNaN()) throw new Error("Valor monetario inválido");
    return new Money(d);
  }
  asDecimal() {
    return this.v;
  }
}
