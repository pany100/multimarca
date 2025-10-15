import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";
import { CreateLlegadaTardeData } from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";

export class CreateLlegadaTardeUseCase {
  constructor(private readonly repository: LlegadaTardeRepository) {}

  async execute(data: CreateLlegadaTardeData) {
    return this.repository.create(data);
  }
}
