import { PremioRepository } from "@/core/domain/repositories/premio.repository";
import { UpdatePremioData } from "@/core/infrastructure/validation/schemas/premio.schema";

export class UpdatePremioUseCase {
  constructor(private readonly repository: PremioRepository) {}

  async execute(data: UpdatePremioData) {
    return this.repository.update(data);
  }
}
