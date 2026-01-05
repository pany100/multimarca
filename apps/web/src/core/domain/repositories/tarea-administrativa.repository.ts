import { TareaAdministrativa } from "@prisma/client";

export interface TareaAdministrativaRepository {
  create(data: {
    presupuestoId: number;
    usuarioId: number;
    descripcion: string;
  }): Promise<TareaAdministrativa>;

  update(
    id: number,
    data: {
      usuarioId?: number;
      descripcion?: string;
    }
  ): Promise<TareaAdministrativa>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<TareaAdministrativa | null>;
}
