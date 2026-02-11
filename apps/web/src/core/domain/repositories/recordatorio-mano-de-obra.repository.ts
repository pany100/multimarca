/**
 * Fila cruda de trabajos con recordatorio (orden terminada + cliente + trabajo con diasParaRecordatorio).
 * diasParaRecordatorio es JSON array [30, 60, 90].
 */
export type TrabajoConRecordatorioRow = {
  fullName: string;
  phone: string;
  fechaSalidaReparacion: Date;
  patent: string;
  kilometros: number | null;
  descripcion: string;
  diasParaRecordatorio: unknown;
};

export interface RecordatorioManoDeObraRepository {
  findTrabajosConRecordatorio(): Promise<TrabajoConRecordatorioRow[]>;
}
