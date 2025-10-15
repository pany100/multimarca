import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";

export class GetLlegadaTardeUseCase {
  constructor(private readonly repository: LlegadaTardeRepository) {}

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
