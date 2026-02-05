import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";
import { ListManoDeObraQuery } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";

export class ListManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(query: ListManoDeObraQuery) {
    return this.repository.list(query);
  }
}
