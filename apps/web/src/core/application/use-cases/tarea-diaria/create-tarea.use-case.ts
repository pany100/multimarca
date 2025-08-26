import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";
import { NotifierPort } from "@/core/domain/ports/notifier.port";

export class CreateTareaUseCase {
  constructor(
    private readonly service: TareaDiariaService,
    private readonly notifier: NotifierPort
  ) {}

  async execute(input: { descripcion: string; userId: number }) {
    if (!input.descripcion.trim()) throw new Error("Descripción obligatoria");

    const tarea = await this.service.create({
      descripcion: input.descripcion.trim(),
      fecha: new Date(),
      realizado: false,
      usuarioId: input.userId,
    });

    this.notifier.emit("newTarea", { id: tarea.id });

    return tarea;
  }
}
