import { AgendaService } from "@/core/application/services/agenda.service";

export class CreateAgendaUseCase {
  constructor(private readonly service: AgendaService) {}

  async execute(input: {
    titulo: string;
    descripcion?: string | null;
    fecha: string | Date;
    hecho?: boolean;
    userId: number;
  }) {
    const fechaDate = new Date(input.fecha);
    if (Number.isNaN(fechaDate.getTime())) {
      throw new Error("La fecha proporcionada no es válida");
    }

    return this.service.create({
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      fecha: fechaDate,
      hecho: Boolean(input.hecho),
      userId: input.userId,
    });
  }
}
