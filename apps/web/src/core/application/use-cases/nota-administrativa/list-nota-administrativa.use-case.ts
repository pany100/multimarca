import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";
import { ListNotaAdministrativaQuery } from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";

export class ListNotaAdministrativaUseCase {
  constructor(private readonly repository: NotaAdministrativaRepository) {}

  async execute(query: ListNotaAdministrativaQuery) {
    return this.repository.list(query);
  }
}
