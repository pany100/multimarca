import { Pago } from "../value-objects/pago.vo";
import { PriceAdjustments } from "../value-objects/price-adjustments.vo";
import { ReparacionTercero } from "../value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "../value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "../value-objects/trabajo-realizado.vo";

export class ComprobanteCalculado {
  constructor(
    private readonly repuestos: RepuestoUsado[],
    private readonly terceros: ReparacionTercero[],
    private readonly trabajos: TrabajoRealizado[],
    private readonly pagos: Pago[],
    private readonly ajustes: PriceAdjustments
  ) {}

  private roundToNearestThousandOrFiveHundred(value: number): number {
    return Math.ceil(value / 500) * 500;
  }

  private calcularPrecioFinal(
    precio: number,
    porcentajeRecargo: number
  ): number {
    const recargoNum = Number(porcentajeRecargo) || 0;
    const precioNum = Number(precio);
    if (recargoNum === 0) {
      return parseFloat(precioNum.toFixed(2));
    }
    const recargo = (precioNum * recargoNum) / 100;
    const total = this.roundToNearestThousandOrFiveHundred(precioNum + recargo);

    return parseFloat(total.toFixed(2));
  }

  get totalRepuestos() {
    return this.repuestos.reduce(
      (acc, r) =>
        acc +
        this.calcularPrecioFinal(
          r.precioVenta.toNumber(),
          this.ajustes.porcentajeRecargo
        ),
      0
    );
  }

  get totalTerceros() {
    return this.terceros.reduce(
      (acc, t) =>
        acc +
        this.calcularPrecioFinal(
          t.precioVenta.toNumber(),
          this.ajustes.porcentajeRecargo
        ),
      0
    );
  }

  get totalManoDeObra() {
    return this.trabajos.reduce(
      (acc, t) =>
        acc +
        this.calcularPrecioFinal(
          t.precioUnitario.toNumber(),
          this.ajustes.porcentajeRecargo
        ),
      0
    );
  }

  get totalBase() {
    return this.totalRepuestos + this.totalTerceros + this.totalManoDeObra;
  }

  get total() {
    return this.ajustes.applyTo(this.totalBase);
  }

  get totalPagado() {
    return this.pagos.reduce((acc, p) => {
      if (p.isInDolars && p.dolar) {
        return acc + p.monto.toNumber() * p.dolar.blue;
      }
      return acc + p.monto.toNumber();
    }, 0);
  }

  get deuda() {
    return this.total - this.totalPagado;
  }
}
