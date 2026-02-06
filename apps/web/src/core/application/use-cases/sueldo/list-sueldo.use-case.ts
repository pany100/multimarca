import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";
import { ListSueldoQuery } from "@/core/infrastructure/validation/schemas/sueldo.schema";

export class ListSueldoUseCase {
  constructor(private readonly repository: SueldoRepository) {}

  async execute(query: ListSueldoQuery) {
    return this.repository.list(query);
  }
}
