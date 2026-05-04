import { Pago } from "../value-objects/pago.vo";
import { PriceAdjustments } from "../value-objects/price-adjustments.vo";
import { ReparacionTercero } from "../value-objects/reparacion-tercero.vo";
import { RepuestoUsado } from "../value-objects/repuesto-usado.vo";
import { TrabajoRealizado } from "../value-objects/trabajo-realizado.vo";

export class ComprobanteCalculado {
  private _distribucionCache:
    | { terceros: number[]; repuestos: number[]; trabajos: number[] }
    | undefined;

  constructor(
    private readonly repuestos: RepuestoUsado[],
    private readonly terceros: ReparacionTercero[],
    private readonly trabajos: TrabajoRealizado[],
    private readonly pagos: Pago[],
    private readonly ajustes: PriceAdjustments,
    private readonly descuentoParaManoDeObraValue: number = 0,
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

  public getPrecioFinalForReparaciones(precio: number, idx: number = 0) {
    const base = this.calcularPrecioFinal(
      precio,
      this.ajustes.porcentajeRecargo,
    );
    return base + (this.getDistribucion().terceros[idx] ?? 0);
  }

  public getPrecioFinalForRepuestos(precio: number, idx: number = 0) {
    const base = this.calcularPrecioFinal(precio, 0);
    return base + (this.getDistribucion().repuestos[idx] ?? 0);
  }

  get manoDeObraForRecibos() {
    return this.totalManoDeObra + this.ajustes.incrementoInternoTotal;
  }

  get incrementoInternoEfectivo() {
    const legacy = this.ajustes.incrementoInterno;
    const fromAjustes = this.ajustes
      .getAjustesConMontoEfectivo(this.totalBase)
      .filter((a) => a.esInterno)
      .reduce((sum, a) => sum + a.montoEfectivo, 0);
    return legacy + fromAjustes;
  }

  /**
   * Distribuye el incremento interno entre todos los items (terceros, repuestos
   * y mano de obra) proporcionalmente al peso de cada uno en `totalBase`. Cada
   * item recibe `incremento * (precioBase / totalBase)`, redondeado a centavos.
   * El último item recibe el residuo para que la suma de adiciones cierre
   * exacto contra el incremento.
   */
  private getDistribucion() {
    if (this._distribucionCache) return this._distribucionCache;

    const tercerosBase = this.terceros.map((t) =>
      this.calcularPrecioFinal(
        t.precioVenta.toNumber(),
        this.ajustes.porcentajeRecargo,
      ),
    );
    const repuestosBase = this.repuestos.map((r) =>
      this.calcularPrecioFinal(r.precioVenta.toNumber(), 0),
    );
    const trabajosBase = this.trabajos.map((t) =>
      this.calcularPrecioFinal(t.precioConIva, 0),
    );
    const allBases = [...tercerosBase, ...repuestosBase, ...trabajosBase];
    const additions = new Array<number>(allBases.length).fill(0);

    const incremento = this.incrementoInternoEfectivo;
    const totalBase = allBases.reduce((s, v) => s + v, 0);

    if (incremento > 0 && totalBase > 0 && allBases.length > 0) {
      let asignado = 0;
      for (let i = 0; i < allBases.length - 1; i++) {
        const cuota =
          Math.round(((incremento * allBases[i]) / totalBase) * 100) / 100;
        additions[i] = cuota;
        asignado += cuota;
      }
      additions[allBases.length - 1] = parseFloat(
        (incremento - asignado).toFixed(2),
      );
    }

    const tCount = this.terceros.length;
    const rCount = this.repuestos.length;
    this._distribucionCache = {
      terceros: additions.slice(0, tCount),
      repuestos: additions.slice(tCount, tCount + rCount),
      trabajos: additions.slice(tCount + rCount),
    };
    return this._distribucionCache;
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

  get manoDeObraForRecibosDiscriminado() {
    const adiciones = this.getDistribucion().trabajos;
    return this.trabajos.map((t, idx) => {
      const base = this.calcularPrecioFinal(t.precioConIva, 0);
      const adicion = adiciones[idx] ?? 0;
      return {
        descripcion: t.descripcion,
        precioUnitario: t.precioUnitario.toNumber(),
        precioConIva: base + adicion,
        iva: t.iva ?? null,
        pdfName: t.pdfName ?? null,
      };
    });
  }

  get incrementoInternoSinAbsorber() {
    return 0;
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
    return Math.max(this.totalManoDeObra - this.descuentoManoDeObraAPagar - this.descuentoParaManoDeObraValue, 0);
  }

  get totalManoDeObraSinIva() {
    return this.trabajos.reduce(
      (acc, t) =>
        acc + this.calcularPrecioFinal(t.precioUnitario.toNumber(), 0),
      0,
    );
  }

  get descuentoManoDeObraAPagarSinIva() {
    const totalDesc = this.ajustes.totalDescuento;
    if (totalDesc === 0 || this.totalSinDescuentos === 0) return 0;
    const porcentajeDescuento = (totalDesc / this.totalSinDescuentos) * 100;
    const descuento = (this.totalManoDeObraSinIva * porcentajeDescuento) / 100;
    return this.roundToNearestThousandOrFiveHundred(descuento);
  }

  get manoDeObraAPagarSinIva() {
    return Math.max(
      this.totalManoDeObraSinIva - this.descuentoManoDeObraAPagarSinIva - this.descuentoParaManoDeObraValue,
      0,
    );
  }
}
