import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";
import { CreateNotaAdministrativaData } from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";

export class CreateNotaAdministrativaUseCase {
  constructor(private readonly repository: NotaAdministrativaRepository) {}

  async execute(data: CreateNotaAdministrativaData) {
    return this.repository.create(data);
  }
}
