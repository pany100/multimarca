import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";

export class GetNotaAdministrativaByIdUseCase {
  constructor(private readonly repository: NotaAdministrativaRepository) {}

  async execute(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error("Nota administrativa no encontrada");
    }
    return item;
  }
}
