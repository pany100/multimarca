import { PremioRepository } from "@/core/domain/repositories/premio.repository";

export class GetPremioUseCase {
  constructor(private readonly repository: PremioRepository) {}

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
