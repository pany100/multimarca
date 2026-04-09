export type TipoAjuste = "porcentual" | "fijo";
export type ModoAjustes = "acumulativo" | "sobreTotalBase";

export class AjustePrecioItem {
  constructor(
    public readonly descripcion: string,
    public readonly monto: number,
    public readonly tipo: TipoAjuste,
    public readonly esDescuento: boolean,
    public readonly esInterno: boolean = false,
    public readonly orden: number = 0,
  ) {}

  aplicar(base: number): number {
    const valor =
      this.tipo === "porcentual" ? (base * this.monto) / 100 : this.monto;
    return this.esDescuento ? -valor : valor;
  }
}
