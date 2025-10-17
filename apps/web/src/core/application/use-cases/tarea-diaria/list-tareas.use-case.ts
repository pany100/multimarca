import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";

export class ListTareasUseCase {
  constructor(private readonly service: TareaDiariaService) {}

  async execute(input: {
    from?: string | null;
    to?: string | null;
    search?: string;
    nombre?: string;
    user: { id: number; rol?: { name?: string } };
  }) {
    let from: Date | undefined;
    let to: Date | undefined;
    
    if (input.from) {
      from = new Date(input.from);
      if (Number.isNaN(from.getTime())) throw new Error("Fecha desde inválida");
    }

    if (input.to) {
      to = new Date(input.to);
      if (Number.isNaN(to.getTime())) throw new Error("Fecha hasta inválida");
    }

    return this.service.list({
      from,
      to,
      search: input.search,
      nombre: input.nombre,
      user: input.user,
    });
  }
}
