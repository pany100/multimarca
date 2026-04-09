export interface TrabajoRealizadoRepository {
  add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      precioUnitario: number;
      descripcion: string;
      diasParaRecordatorio?: number[] | null;
      pdfName?: string | null;
      iva?: number | null;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  update(
    id: number,
    data: {
      precioUnitario?: number;
      descripcion?: string;
      diasParaRecordatorio?: number[] | null;
      pdfName?: string | null;
      iva?: number | null;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  delete(id: number): Promise<any>;
}
