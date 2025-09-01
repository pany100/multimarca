import { EstadoPresupuesto } from "@prisma/client";
import { PriceAdjustments } from "./price-adjustments.vo";
import { ReparacionTercero } from "./reparacion-tercero.vo";
import { RepuestoUsado } from "./repuesto-usado.vo";
import { TareasAdministrativasVO } from "./tareas-administrativas.vo";
import { TrabajoRealizado } from "./trabajo-realizado.vo";

export type PresupuestoProps = {
  id?: number | null;
  priceAdjustmentsVO: PriceAdjustments;
  repuestosVO: RepuestoUsado[];
  trabajosVO: TrabajoRealizado[];
  tercerosVO: ReparacionTercero[];
  autoId: number | null;
  fecha: Date;
  fechaRespuesta: Date | null;
  fechaEnvio: Date | null;
  observacionesCliente: string;
  detallesDeTrabajo?: string;
  informacionAuto?: string;
  informacionCliente?: string;
  estado: string;
  dolarId?: number | null;
  descuento?: number;
  descripcionDescuento?: string | null;
  incremento?: number;
  descripcionIncremento?: string | null;
  incrementoInterno?: number;
  porcentajeRecargo?: number;
  tareasAdministrativas?: TareasAdministrativasVO[];
};

export class PresupuestoVO {
  constructor(
    public readonly id: number | null,
    public readonly priceAdjustmentsVO: PriceAdjustments,
    public readonly repuestosVO: RepuestoUsado[],
    public readonly trabajosVO: TrabajoRealizado[],
    public readonly tercerosVO: ReparacionTercero[],
    public readonly autoId: number | null,
    public readonly fecha: Date = new Date(),
    public readonly fechaRespuesta: Date | null = null,
    public readonly fechaEnvio: Date | null = null,
    public readonly observacionesCliente: string,
    public readonly detallesDeTrabajo: string = "",
    public readonly informacionAuto: string = "",
    public readonly informacionCliente: string = "",
    public readonly estado: EstadoPresupuesto,
    public readonly dolarId: number | null = null,
    public readonly descuento: number = 0,
    public readonly descripcionDescuento: string | null = null,
    public readonly incremento: number = 0,
    public readonly descripcionIncremento: string | null = null,
    public readonly incrementoInterno: number = 0,
    public readonly porcentajeRecargo: number = 0,
    public readonly tareasAdministrativas: any[] = []
  ) {}

  static async from(props: PresupuestoProps): Promise<PresupuestoVO> {
    return new PresupuestoVO(
      props.id || null,
      props.priceAdjustmentsVO,
      props.repuestosVO,
      props.trabajosVO,
      props.tercerosVO,
      props.autoId,
      props.fecha,
      props.fechaRespuesta,
      props.fechaEnvio,
      props.observacionesCliente,
      props.detallesDeTrabajo,
      props.informacionAuto,
      props.informacionCliente,
      props.estado as EstadoPresupuesto,
      props.dolarId,
      props.descuento,
      props.descripcionDescuento,
      props.incremento,
      props.descripcionIncremento,
      props.incrementoInterno,
      props.porcentajeRecargo,
      props.tareasAdministrativas
    );
  }
}
