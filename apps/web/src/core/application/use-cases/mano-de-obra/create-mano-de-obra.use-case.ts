import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";
import { CreateManoDeObraData } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";

export class CreateManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(data: CreateManoDeObraData) {
    return this.repository.create(data);
  }
}
