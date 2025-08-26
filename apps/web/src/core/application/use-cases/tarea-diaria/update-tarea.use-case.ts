import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";
import { canManageTask } from "@/core/domain/policies/tareas-diarias.policy";
import type { NotifierPort } from "@/core/domain/ports/notifier.port";

export class UpdateTareaUseCase {
  constructor(
    private readonly service: TareaDiariaService,
    private readonly notifier: NotifierPort
  ) {}

  async execute(params: {
    id: number;
    user: { id: number; rol?: { name?: string } };
    data: { descripcion?: string; realizado?: boolean };
  }) {
    const tarea = await this.service.findById(params.id);
    if (!tarea) throw new Error("Tarea no encontrada");
    if (!canManageTask(params.user, tarea))
      throw new Error("No tienes permiso para modificar esta tarea");

    const updated = await this.service.updatePartial(params.id, params.data);

    // emite según estado (igual que tu lógica actual)
    if (typeof params.data.realizado === "boolean") {
      if (updated.realizado) this.notifier.emit("deleteTarea");
      else this.notifier.emit("newTarea");
    }

    return updated;
  }
}
