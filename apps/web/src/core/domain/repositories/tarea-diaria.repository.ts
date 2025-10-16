export type ListTareasParams = {
  fecha?: Date; // día base (opcional, por defecto hoy)
  incluirAnteriores?: boolean; // incluye pendientes hasta 365 días atrás
  search?: string; // búsqueda por texto en descripción
  nombre?: string; // búsqueda por nombre de usuario
  user: { id: number; rol?: { name?: string } }; // filtra por usuario si no es admin
};

export type CreateTareaInput = {
  descripcion: string;
  fecha: Date;
  realizado: boolean;
  usuarioId: number;
};

export interface TareaDiariaRepository {
  list(params: ListTareasParams): Promise<any[]>;
  create(input: CreateTareaInput): Promise<any>;
  findById(id: number): Promise<any | null>;
  updatePartial(
    id: number,
    data: Partial<Pick<CreateTareaInput, "descripcion" | "realizado">>
  ): Promise<any>;
  delete(id: number): Promise<void>;
}
