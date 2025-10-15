import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";

export class DeleteLlegadaTardeUseCase {
  constructor(private readonly repository: LlegadaTardeRepository) {}

  async execute(id: number) {
    return this.repository.delete(id);
  }
}
