import { PremioRepository } from "@/core/domain/repositories/premio.repository";
import { CreatePremioData } from "@/core/infrastructure/validation/schemas/premio.schema";

export class CreatePremioUseCase {
  constructor(private readonly repository: PremioRepository) {}

  async execute(data: CreatePremioData) {
    return this.repository.create(data);
  }
}
