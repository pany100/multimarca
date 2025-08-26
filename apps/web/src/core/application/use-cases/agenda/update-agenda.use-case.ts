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
    }
  ) {
    const existing = await this.service.findById(id);
    if (!existing) throw new Error("Recordatorio no encontrado");
    // reglas de negocio adicionales acá si hiciera falta
    return this.service.update(id, data);
  }
}
