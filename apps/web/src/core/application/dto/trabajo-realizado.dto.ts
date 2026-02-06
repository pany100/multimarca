export interface AddTrabajoRealizadoDto {
  ordenReparacionId?: number;
  ventaId?: number;
  presupuestoId?: number;
  precioUnitario: number;
  descripcion: string;
  diasParaRecordatorio?: number[] | null;
  pdfName?: string | null;
}

export interface UpdateTrabajoRealizadoDto {
  id: number;
  precioUnitario?: number;
  descripcion?: string;
  diasParaRecordatorio?: number[] | null;
  pdfName?: string | null;
}

export interface DeleteTrabajoRealizadoDto {
  id: number;
}
