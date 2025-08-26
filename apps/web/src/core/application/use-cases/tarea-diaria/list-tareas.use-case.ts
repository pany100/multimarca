import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";

export class ListTareasUseCase {
  constructor(private readonly service: TareaDiariaService) {}

  async execute(input: {
    fecha: string | Date;
    incluirAnteriores: boolean;
    user: { id: number; rol?: { name?: string } };
  }) {
    const fecha = new Date(input.fecha);
    if (Number.isNaN(fecha.getTime())) throw new Error("Fecha inválida");

    return this.service.list({
      fecha,
      incluirAnteriores: !!input.incluirAnteriores,
      user: input.user,
    });
  }
}
