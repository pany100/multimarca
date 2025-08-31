import { EstadoOrden } from "./estado-orden.vo";
import { MecanicoRef } from "./mecanico-ref.vo";
import { PriceAdjustments } from "./price-adjustments.vo";
import { ReparacionTercero } from "./reparacion-tercero.vo";
import { RepuestoUsado } from "./repuesto-usado.vo";
import { TrabajoRealizado } from "./trabajo-realizado.vo";

export type OrdenReparacionProps = {
  priceAdjustmentsVO: PriceAdjustments;
  mecanicosVO: MecanicoRef[];
  repuestosVO: RepuestoUsado[];
  trabajosVO: TrabajoRealizado[];
  tercerosVO: ReparacionTercero[];
  autoId: number;
  fechaEntradaReparacion?: Date | null;
  fechaSalidaReparacion?: Date | null;
  fechaCreacion?: Date;
  kilometros?: number | null;
  observacionesCliente: string;
  observacionesEntrada?: string;
  observacionesSalida?: string;
  observacionesOcultas?: string | null;
  estado: EstadoOrden;
  pdfPath?: string | null;
  descuento?: number;
  descripcionDescuento?: string | null;
  incremento?: number;
  descripcionIncremento?: string | null;
  incrementoInterno?: number;
  porcentajeRecargo?: number;
  dolarId?: number;
  controlesEnReparacion?: ControlesEnReparacionProps[];
};

type ControlesEnReparacionProps = {
  id: number;
  type: string;
};

export class OrdenReparacionVO {
  constructor(
    public readonly priceAdjustmentsVO: PriceAdjustments,
    public readonly mecanicosVO: MecanicoRef[],
    public readonly repuestosVO: RepuestoUsado[],
    public readonly trabajosVO: TrabajoRealizado[],
    public readonly tercerosVO: ReparacionTercero[],
    public readonly autoId: number,
    public readonly fechaEntradaReparacion: Date | null = null,
    public readonly fechaSalidaReparacion: Date | null = null,
    public readonly fechaCreacion: Date = new Date(),
    public readonly kilometros: number | null = null,
    public readonly observacionesCliente: string,
    public readonly observacionesEntrada: string = "[]",
    public readonly observacionesSalida: string = "[]",
    public readonly observacionesOcultas: string | null = null,
    public readonly estado: EstadoOrden,
    public readonly pdfPath: string | null = null,
    public readonly descuento: number = 0,
    public readonly descripcionDescuento: string | null = null,
    public readonly incremento: number = 0,
    public readonly descripcionIncremento: string | null = null,
    public readonly incrementoInterno: number = 0,
    public readonly porcentajeRecargo: number = 0,
    public readonly dolarId: number | null = null,
    public readonly controlesEnReparacion: ControlesEnReparacionProps[] = []
  ) {}

  static from(props: OrdenReparacionProps): OrdenReparacionVO {
    return new OrdenReparacionVO(
      props.priceAdjustmentsVO,
      props.mecanicosVO,
      props.repuestosVO,
      props.trabajosVO,
      props.tercerosVO,
      props.autoId,
      props.fechaEntradaReparacion,
      props.fechaSalidaReparacion,
      props.fechaCreacion,
      props.kilometros,
      props.observacionesCliente,
      props.observacionesEntrada,
      props.observacionesSalida,
      props.observacionesOcultas,
      props.estado,
      props.pdfPath,
      props.descuento,
      props.descripcionDescuento,
      props.incremento,
      props.descripcionIncremento,
      props.incrementoInterno,
      props.porcentajeRecargo,
      props.dolarId,
      props.controlesEnReparacion
    );
  }
}
