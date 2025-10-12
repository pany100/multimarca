import { AgendaService } from "@/core/application/services/agenda.service";

export class UpdateAgendaUseCase {
  constructor(private readonly service: AgendaService) {}
  async execute(
    id: number,
    data: {
      titulo?: string;
      descripcion?: string | null;
      fecha?: Date;
      hecho?: boolean;
      updatingRecurrentEvent: boolean;
    },
    user: {
      id: number;
      rol: {
        id: number;
        name: string;
      };
    }
  ) {
    const existing = await this.service.findById(id);
    if (!existing) throw new Error("Recordatorio no encontrado");
    if (!existing.general && existing.userId !== user.id && user.rol.id !== 1) {
      throw new Error("No tienes permiso");
    }
    // reglas de negocio adicionales acá si hiciera falta
    return this.service.update(id, data);
  }
}
