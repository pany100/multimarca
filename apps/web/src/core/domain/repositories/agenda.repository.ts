export type ListAgendaParams = {
  page: number;
  size: number;
  query?: string;
  month?: number; // 1..12
  year?: number; // yyyy
  onlyPending?: boolean;
  general: boolean;
};

export type CreateAgendaInput = {
  titulo: string;
  descripcion?: string | null;
  fecha: Date;
  hecho?: boolean;
  userId: number;
  general: boolean;
};

export interface AgendaRepository {
  list(params: ListAgendaParams): Promise<{ items: any[]; total: number }>;
  create(input: CreateAgendaInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  update(id: number, data: Partial<CreateAgendaInput>): Promise<any>;
  delete(id: number): Promise<void>;
}
