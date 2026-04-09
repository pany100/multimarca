import { Prisma } from "@prisma/client";
import { AjustePrecioItem, ModoAjustes } from "./ajuste-precio.vo";

export class PriceAdjustments {
  private constructor(
    public readonly descuento: number,
    public readonly incremento: number,
    public readonly incrementoInterno: number,
    public readonly porcentajeRecargo: number,
    public readonly ajustes: AjustePrecioItem[] = [],
    public readonly modoAjustes: ModoAjustes = "sobreTotalBase",
  ) {}

  get usesLegacyMode(): boolean {
    return this.ajustes.length === 0;
  }

  get incrementoInternoTotal(): number {
    if (this.usesLegacyMode) return this.incrementoInterno;
    return this.ajustes
      .filter((a) => a.esInterno)
      .reduce((sum, a) => sum + a.monto, 0);
  }

  get totalDescuento(): number {
    if (this.usesLegacyMode) return this.descuento;
    return Math.abs(
      this.ajustes
        .filter((a) => a.esDescuento)
        .reduce((sum, a) => sum + a.aplicar(0), 0),
    );
  }

  get ajustesDesglosados(): {
    descripcion: string;
    monto: number;
    esDescuento: boolean;
    esInterno: boolean;
    tipo: string;
  }[] {
    return this.ajustes.map((a) => ({
      descripcion: a.descripcion,
      monto: a.monto,
      esDescuento: a.esDescuento,
      esInterno: a.esInterno,
      tipo: a.tipo,
    }));
  }

  static normalize(input: Partial<PriceAdjustments>) {
    const num = (n?: number) => (typeof n === "number" ? n : 0);
    return new PriceAdjustments(
      num(input.descuento),
      num(input.incremento),
      num(input.incrementoInterno),
      num(input.porcentajeRecargo),
      input.ajustes ?? [],
      input.modoAjustes ?? "sobreTotalBase",
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
      Number(input.porcentajeRecargo),
    );
  }

  static normalizeFromHttp(input: Partial<PriceAdjustments>) {
    const num = (n?: number) => (typeof n === "number" ? n : 0);
    return new PriceAdjustments(
      num(input.descuento),
      num(input.incremento),
      num(input.incrementoInterno),
      num(input.porcentajeRecargo),
      input.ajustes ?? [],
      input.modoAjustes ?? "sobreTotalBase",
    );
  }

  static fromAjustesList(
    ajustes: AjustePrecioItem[],
    modoAjustes: ModoAjustes,
    porcentajeRecargo: number,
  ) {
    return new PriceAdjustments(
      0,
      0,
      0,
      porcentajeRecargo,
      ajustes,
      modoAjustes,
    );
  }

  applyTo(precio: number) {
    if (this.usesLegacyMode) {
      return precio + this.incrementoInterno - this.descuento + this.incremento;
    }
    return this.applyAjustes(precio);
  }

  applyToWithoutDiscount(precio: number) {
    if (this.usesLegacyMode) {
      return precio + this.incrementoInterno + this.incremento;
    }
    return this.applyAjustes(
      precio,
      this.ajustes.filter((a) => !a.esDescuento),
    );
  }

  private applyAjustes(
    precioBase: number,
    ajustes: AjustePrecioItem[] = this.ajustes,
  ): number {
    const sorted = [...ajustes].sort((a, b) => a.orden - b.orden);

    if (this.modoAjustes === "sobreTotalBase") {
      return (
        precioBase + sorted.reduce((sum, a) => sum + a.aplicar(precioBase), 0)
      );
    }

    // acumulativo: cada ajuste se aplica sobre el total acumulado
    return sorted.reduce(
      (running, a) => running + a.aplicar(running),
      precioBase,
    );
  }
}
