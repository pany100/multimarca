import { Moneda, Prisma } from "@prisma/client";

type DolarFromDB = {
  oficial: Prisma.Decimal;
  blue: Prisma.Decimal;
};

type Dolar = {
  blue: number;
  oficial: number;
};

export class Pago {
  constructor(
    public readonly monto: Prisma.Decimal,
    public readonly dolar?: Dolar | null,
    public readonly moneda?: Moneda
  ) {}
  static fromOrderDb(p: {
    dolar?: DolarFromDB | null;
    monto: Prisma.Decimal;
    moneda: Moneda;
  }) {
    if (p.dolar) {
      return new Pago(
        p.monto,
        {
          blue: Number(p.dolar.blue),
          oficial: Number(p.dolar.oficial),
        },
        p.moneda
      );
    }
    return new Pago(p.monto, null, p.moneda);
  }

  get isInDolars() {
    return this.moneda === Moneda.Dolar;
  }
}
