import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";
import { UpdateManoDeObraData } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";

export class UpdateManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(data: UpdateManoDeObraData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Trabajo de mano de obra no encontrado");
    }
    return this.repository.update(data);
  }
}
