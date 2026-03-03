/**
 * Datos para crear un turno.
 */
export type CreateTurnoData = {
  hora: string;
  fecha: Date;
  problema: string;
  autoId: number | null;
  informacionAuto: string | null;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  vino: boolean | null;
  observaciones: string | null;
};

/**
 * Datos para actualizar un turno (PUT).
 */
export type UpdateTurnoData = CreateTurnoData;

export type ListTurnosParams = {
  page: number;
  size: number;
  query: string;
  fecha?: string;
  future?: boolean;
};

export type ListTurnosResult = {
  items: any[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

export interface TurnoRepository {
  findMany(params: ListTurnosParams): Promise<ListTurnosResult>;
  findById(id: number): Promise<any | null>;
  create(data: CreateTurnoData): Promise<any>;
  update(id: number, data: UpdateTurnoData): Promise<any>;
  updateVino(id: number, vino: boolean): Promise<any>;
  delete(id: number): Promise<void>;
}
