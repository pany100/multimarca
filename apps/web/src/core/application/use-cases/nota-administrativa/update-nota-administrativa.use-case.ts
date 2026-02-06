import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";
import { UpdateNotaAdministrativaData } from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";

export class UpdateNotaAdministrativaUseCase {
  constructor(private readonly repository: NotaAdministrativaRepository) {}

  async execute(data: UpdateNotaAdministrativaData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Nota administrativa no encontrada");
    }
    return this.repository.update(data);
  }
}
