import { Recurrence } from "@prisma/client";

export type ListAgendaParams = {
  month: number;
  year: number;
  onlyPending?: boolean;
  general: boolean;
  userId: number;
};

export type CreateAgendaInput = {
  titulo: string;
  descripcion?: string | null;
  fecha: Date;
  hecho?: boolean;
  userId: number;
  general: boolean;
  recurrence?: Recurrence;
  fechaFinRecurrencia?: Date | null;
};

export type CreateAgendaExceptionInput = {
  fecha: Date;
  recordatorioId: number;
};

export interface AgendaRepository {
  list(params: ListAgendaParams): Promise<{ items: any[]; total: number }>;
  create(input: CreateAgendaInput, deps?: { tx?: any }): Promise<any>;
  listByDay({
    year,
    month,
    day,
    onlyPending,
  }: {
    year: number;
    month: number;
    day: number;
    onlyPending?: boolean;
  }): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  update(
    id: number,
    data: Partial<CreateAgendaInput>,
    deps?: { tx?: any }
  ): Promise<any>;
  delete(id: number): Promise<void>;
  createException(
    params: CreateAgendaExceptionInput,
    deps?: { tx?: any }
  ): Promise<any>;
  findExceptionsByRecordatorioId(recordatorioId: number): Promise<any[]>;
}
