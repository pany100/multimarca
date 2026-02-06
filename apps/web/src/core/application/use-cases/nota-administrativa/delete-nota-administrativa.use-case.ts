import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";

export class DeleteNotaAdministrativaUseCase {
  constructor(private readonly repository: NotaAdministrativaRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Nota administrativa no encontrada");
    }
    return this.repository.delete(id);
  }
}
