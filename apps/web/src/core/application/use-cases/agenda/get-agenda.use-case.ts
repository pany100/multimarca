import { AgendaService } from "@/core/application/services/agenda.service";

export class GetAgendaUseCase {
  constructor(private readonly service: AgendaService) {}
  async execute(id: number) {
    const item = await this.service.findById(id);
    if (!item) throw new Error("Recordatorio no encontrado");
    return item;
  }
}
