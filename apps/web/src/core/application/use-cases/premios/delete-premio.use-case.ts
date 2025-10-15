import { PremioRepository } from "@/core/domain/repositories/premio.repository";

export class DeletePremioUseCase {
  constructor(private readonly repository: PremioRepository) {}

  async execute(id: number) {
    return this.repository.delete(id);
  }
}
