import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";

export class ListTareasUseCase {
  constructor(private readonly service: TareaDiariaService) {}

  async execute(input: {
    fecha?: string | Date;
    incluirAnteriores: boolean;
    search?: string;
    nombre?: string;
    user: { id: number; rol?: { name?: string } };
  }) {
    let fecha: Date | undefined;
    
    if (input.fecha) {
      fecha = new Date(input.fecha);
      if (Number.isNaN(fecha.getTime())) throw new Error("Fecha inválida");
    }

    return this.service.list({
      fecha,
      incluirAnteriores: !!input.incluirAnteriores,
      search: input.search,
      nombre: input.nombre,
      user: input.user,
    });
  }
}
