import { Moneda, Prisma } from "@prisma/client";

export class Pago {
  constructor(
    public readonly monto: Prisma.Decimal,
    public readonly cotizacionDolar: number,
    public readonly moneda?: Moneda
  ) {}
  static fromOrderDb(p: {
    cotizacionDolar: number;
    monto: Prisma.Decimal;
    moneda: Moneda;
  }) {
    return new Pago(p.monto, p.cotizacionDolar, p.moneda);
  }

  get isInDolars() {
    return this.moneda === Moneda.Dolar;
  }
}
