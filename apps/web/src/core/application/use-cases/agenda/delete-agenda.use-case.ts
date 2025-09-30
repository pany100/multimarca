import { AgendaService } from "@/core/application/services/agenda.service";

export class DeleteAgendaUseCase {
  constructor(private readonly service: AgendaService) {}
  async execute(
    id: number,
    user: { id: number; rol: { id: number; name: string } }
  ) {
    const existing = await this.service.findById(id);
    if (!existing) throw new Error("Recordatorio no encontrado");
    if (existing.userId !== user.id && user.rol.id !== 1) {
      throw new Error("No tienes permiso");
    }
    await this.service.delete(id);
    return { ok: true };
  }
}
