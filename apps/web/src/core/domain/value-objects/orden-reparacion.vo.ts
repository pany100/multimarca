import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { EstadoOrden } from "./estado-orden.vo";
import { MecanicoRef } from "./mecanico-ref.vo";
import { PriceAdjustments } from "./price-adjustments.vo";
import { ReparacionTercero } from "./reparacion-tercero.vo";
import { RepuestoUsado } from "./repuesto-usado.vo";
import { TrabajoRealizado } from "./trabajo-realizado.vo";

export type OrdenReparacionProps = {
  id?: number;
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
  revisadoPorId?: number;
  detalleControles?: string;
  recibos?: string[];
};

type ControlesEnReparacionProps = {
  id: number;
  type?: string;
  valor?: string;
};

export class OrdenReparacionVO {
  constructor(
    public readonly id: number | null,
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
    public readonly controlesEnReparacion: ControlesEnReparacionProps[] = [],
    public readonly revisadoPorId: number | null = null,
    public readonly detalleControles: string | null = null,
    public readonly recibos: string[] = []
  ) {}

  static async from(
    props: OrdenReparacionProps,
    pdfFile?: File | null
  ): Promise<OrdenReparacionVO> {
    const fileService = new S3FileStorageAdapter();
    let pdfPath = props.pdfPath || null;
    if (pdfFile) {
      pdfPath = await fileService.uploadFileAndGetUrl(pdfFile, "scanner");
    }
    let recibosUrls: string[] = [];
    const recibosToProcess = props.recibos || [];
    if (recibosToProcess.length > 0) {
      recibosUrls = await Promise.all(
        recibosToProcess.map(async (recibo: string) => {
          if (recibo && recibo.includes("/tmp/")) {
            return await fileService.moveTempTo(recibo, "recibos");
          }
          return recibo;
        })
      );
    }

    return new OrdenReparacionVO(
      props.id || null,
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
      pdfPath,
      props.descuento,
      props.descripcionDescuento,
      props.incremento,
      props.descripcionIncremento,
      props.incrementoInterno,
      props.porcentajeRecargo,
      props.dolarId,
      props.controlesEnReparacion,
      props.revisadoPorId,
      props.detalleControles,
      recibosUrls
    );
  }
}
