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
    const fromAjustes = this.ajustes
      .filter((a) => a.esInterno)
      .reduce((sum, a) => sum + a.monto, 0);
    return this.incrementoInterno + fromAjustes;
  }

  get totalDescuento(): number {
    const fromAjustes = Math.abs(
      this.ajustes
        .filter((a) => a.esDescuento)
        .reduce((sum, a) => sum + a.aplicar(0), 0),
    );
    return this.descuento + fromAjustes;
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
    legacy?: {
      descuento: number;
      incremento: number;
      incrementoInterno: number;
    },
  ) {
    return new PriceAdjustments(
      legacy?.descuento ?? 0,
      legacy?.incremento ?? 0,
      legacy?.incrementoInterno ?? 0,
      porcentajeRecargo,
      ajustes,
      modoAjustes,
    );
  }

  /**
   * Calculation order:
   * 1. subtotal = precio + legacy (incrementoInterno + incremento - descuento)
   * 2. Apply % ajustes on subtotal
   * 3. Apply fixed ajustes
   */
  applyTo(precio: number) {
    // 1. Legacy always applies first
    const subtotal =
      precio + this.incrementoInterno - this.descuento + this.incremento;

    if (this.ajustes.length === 0) return subtotal;

    // 2. % ajustes on subtotal, then 3. fixed ajustes
    return this.applyAjustesOverBase(subtotal);
  }

  applyToWithoutDiscount(precio: number) {
    const subtotal = precio + this.incrementoInterno + this.incremento;

    if (this.ajustes.length === 0) return subtotal;

    return this.applyAjustesOverBase(
      subtotal,
      this.ajustes.filter((a) => !a.esDescuento),
    );
  }

  /**
   * Returns each ajuste with its effective peso amount.
   * The base for calculation is totalBase + legacy adjustments.
   */
  getAjustesConMontoEfectivo(totalBase: number): {
    descripcion: string;
    montoOriginal: number;
    montoEfectivo: number;
    esDescuento: boolean;
    esInterno: boolean;
    tipo: string;
  }[] {
    if (this.ajustes.length === 0) return [];

    // Base = totalBase + legacy
    const base =
      totalBase + this.incrementoInterno - this.descuento + this.incremento;

    const porcentuales = [...this.ajustes]
      .filter((a) => a.tipo === "porcentual")
      .sort((a, b) => a.orden - b.orden);
    const fijos = [...this.ajustes]
      .filter((a) => a.tipo === "fijo")
      .sort((a, b) => a.orden - b.orden);

    const result: {
      descripcion: string;
      montoOriginal: number;
      montoEfectivo: number;
      esDescuento: boolean;
      esInterno: boolean;
      tipo: string;
    }[] = [];

    // % ajustes calculated on the base
    for (const a of porcentuales) {
      result.push({
        descripcion: a.descripcion,
        montoOriginal: a.monto,
        montoEfectivo: a.aplicar(base),
        esDescuento: a.esDescuento,
        esInterno: a.esInterno,
        tipo: a.tipo,
      });
    }

    // Fixed ajustes are absolute
    for (const a of fijos) {
      result.push({
        descripcion: a.descripcion,
        montoOriginal: a.monto,
        montoEfectivo: a.aplicar(0), // fijo: aplicar(0) = +/- monto
        esDescuento: a.esDescuento,
        esInterno: a.esInterno,
        tipo: a.tipo,
      });
    }

    return result;
  }

  /**
   * Applies ajustes: first % on base, then fixed amounts.
   */
  private applyAjustesOverBase(
    base: number,
    ajustes: AjustePrecioItem[] = this.ajustes,
  ): number {
    const porcentuales = ajustes.filter((a) => a.tipo === "porcentual");
    const fijos = ajustes.filter((a) => a.tipo === "fijo");

    // % ajustes always calculated on the base
    const totalPorcentual = porcentuales.reduce(
      (sum, a) => sum + a.aplicar(base),
      0,
    );

    // Fixed ajustes are absolute
    const totalFijo = fijos.reduce((sum, a) => sum + a.aplicar(0), 0);

    return base + totalPorcentual + totalFijo;
  }
}
