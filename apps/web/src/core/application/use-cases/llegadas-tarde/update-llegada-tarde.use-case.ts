import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";
import { UpdateLlegadaTardeData } from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";

export class UpdateLlegadaTardeUseCase {
  constructor(private readonly repository: LlegadaTardeRepository) {}

  async execute(data: UpdateLlegadaTardeData) {
    return this.repository.update(data);
  }
}
