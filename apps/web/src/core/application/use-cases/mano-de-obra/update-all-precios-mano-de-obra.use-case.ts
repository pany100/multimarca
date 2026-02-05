import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";

export class UpdateAllPreciosManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(porcentajeAumento: number) {
    return this.repository.updateAllPrecios(porcentajeAumento);
  }
}
