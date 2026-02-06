import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";
import { CreateSueldoData } from "@/core/infrastructure/validation/schemas/sueldo.schema";

export class CreateSueldoUseCase {
  constructor(private readonly repository: SueldoRepository) {}

  async execute(data: CreateSueldoData) {
    return this.repository.create(data);
  }
}
