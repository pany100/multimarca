import { AgendaService } from "@/core/application/services/agenda.service";

export class DeleteAgendaUseCase {
  constructor(private readonly service: AgendaService) {}
  async execute(id: number) {
    const existing = await this.service.findById(id);
    if (!existing) throw new Error("Recordatorio no encontrado");
    await this.service.delete(id);
    return { ok: true };
  }
}
