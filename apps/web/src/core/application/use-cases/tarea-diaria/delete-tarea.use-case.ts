import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";
import { canManageTask } from "@/core/domain/policies/tareas-diarias.policy";
import type { NotifierPort } from "@/core/domain/ports/notifier.port";

export class DeleteTareaUseCase {
  constructor(
    private readonly service: TareaDiariaService,
    private readonly notifier: NotifierPort
  ) {}

  async execute(params: {
    id: number;
    user: { id: number; rol?: { name?: string } };
  }) {
    const tarea = await this.service.findById(params.id);
    if (!tarea) throw new Error("Tarea no encontrada");
    if (!canManageTask(params.user, tarea))
      throw new Error("No tienes permiso para eliminar esta tarea");

    await this.service.delete(params.id);
    this.notifier.emit("deleteTarea");

    return { message: "Tarea eliminada con éxito" };
  }
}
