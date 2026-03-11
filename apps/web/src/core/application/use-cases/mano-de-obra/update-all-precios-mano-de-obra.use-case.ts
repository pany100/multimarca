import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";

export class UpdateAllPreciosManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(type: "aumento" | "descuento", porcentaje: number) {
    return this.repository.updateAllPrecios(type, porcentaje);
  }
}
