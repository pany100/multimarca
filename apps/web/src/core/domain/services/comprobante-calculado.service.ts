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
    private readonly ajustes: PriceAdjustments,
  ) {}

  private roundToNearestThousandOrFiveHundred(value: number): number {
    return Math.ceil(value / 500) * 500;
  }

  private calcularPrecioFinal(
    precio: number,
    porcentajeRecargo: number,
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

  public getPrecioFinalForReparaciones(precio: number) {
    return this.calcularPrecioFinal(precio, this.ajustes.porcentajeRecargo);
  }

  public getPrecioFinalForRepuestos(precio: number) {
    return this.calcularPrecioFinal(precio, 0);
  }

  get manoDeObraForRecibos() {
    return this.totalManoDeObra + this.ajustes.incrementoInternoTotal;
  }

  get totalRepuestos() {
    return this.repuestos.reduce(
      (acc, r) => acc + this.calcularPrecioFinal(r.precioVenta.toNumber(), 0),
      0,
    );
  }

  get totalTerceros() {
    return this.terceros.reduce(
      (acc, t) =>
        acc +
        this.calcularPrecioFinal(
          t.precioVenta.toNumber(),
          this.ajustes.porcentajeRecargo,
        ),
      0,
    );
  }

  get totalManoDeObra() {
    return this.trabajos.reduce(
      (acc, t) =>
        acc + this.calcularPrecioFinal(t.precioConIva, 0),
      0,
    );
  }

  private getIncrementoDistribuido() {
    const incrementoTotal = this.ajustes.incrementoInternoTotal;
    const incrementoDistribuido = incrementoTotal / this.trabajos.length;
    const incrementoParcial = this.roundToNearestThousandOrFiveHundred(
      incrementoDistribuido,
    );
    const incrementoFinal =
      incrementoTotal - incrementoParcial * (this.trabajos.length - 1);
    return {
      incrementoParcial,
      incrementoFinal,
    };
  }

  get manoDeObraForRecibosDiscriminado() {
    const { incrementoParcial, incrementoFinal } =
      this.getIncrementoDistribuido();
    return this.trabajos.map((t, idx) => {
      const isLast = idx === this.trabajos.length - 1;
      const incremento =
        this.trabajos.length > 0
          ? isLast
            ? incrementoFinal
            : incrementoParcial
          : 0;
      return {
        descripcion: t.descripcion,
        precioUnitario: t.precioUnitario.toNumber(),
        precioConIva:
          this.calcularPrecioFinal(t.precioConIva, 0) + incremento,
        iva: t.iva ?? null,
        pdfName: t.pdfName ?? null,
      };
    });
  }

  get totalBase() {
    return this.totalRepuestos + this.totalTerceros + this.totalManoDeObra;
  }

  get total() {
    return this.ajustes.applyTo(this.totalBase);
  }

  get totalPagado() {
    return this.pagos.reduce((acc, p) => {
      if (p.isInDolars && p.cotizacionDolar) {
        return acc + p.monto.toNumber() * p.cotizacionDolar;
      }
      return acc + p.monto.toNumber();
    }, 0);
  }

  get deuda() {
    return this.total - this.totalPagado;
  }

  get totalSinDescuentos() {
    return this.ajustes.applyToWithoutDiscount(this.totalBase);
  }

  get descuento() {
    return this.ajustes.totalDescuento;
  }

  get ajustesDesglosados() {
    return this.ajustes.ajustesDesglosados;
  }

  get ajustesConMontoEfectivo() {
    return this.ajustes.getAjustesConMontoEfectivo(this.totalBase);
  }

  get descuentoManoDeObraAPagar() {
    const totalDesc = this.ajustes.totalDescuento;
    if (totalDesc === 0) {
      return 0;
    }

    // Si el total sin descuentos es 0, retornar 0 para evitar división por cero
    if (this.totalSinDescuentos === 0) {
      return 0;
    }

    // Calcular el porcentaje de descuento
    const porcentajeDescuento =
      (totalDesc / this.totalSinDescuentos) * 100;
    // Aplicar ese porcentaje a la mano de obra
    const descuentoManoDeObra =
      (this.totalManoDeObra * porcentajeDescuento) / 100;
    return this.roundToNearestThousandOrFiveHundred(descuentoManoDeObra);
  }

  get manoDeObraAPagar() {
    return Math.max(this.totalManoDeObra - this.descuentoManoDeObraAPagar, 0);
  }
}
