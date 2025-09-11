export class EstadisticasBaseVO {
  constructor(
    public readonly anio: string | undefined,
    public readonly mes: string | undefined
  ) {}

  toObjectWithStrings() {
    let fechaInicio: string | undefined;
    let fechaFin: string | undefined;
    if (this.anio && this.mes) {
      fechaInicio = `${this.anio}-${this.mes.padStart(2, "0")}-01`;
      fechaFin =
        this.mes === "12"
          ? `${parseInt(this.anio) + 1}-01-01`
          : `${this.anio}-${String(parseInt(this.mes) + 1).padStart(
              2,
              "0"
            )}-01`;
    } else if (this.anio) {
      fechaInicio = `${this.anio}-01-01`;
      fechaFin = `${parseInt(this.anio) + 1}-01-01`;
    }

    return { fechaInicio, fechaFin };
  }
}
