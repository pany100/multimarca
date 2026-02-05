import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";

export class DeleteManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Trabajo de mano de obra no encontrado");
    }
    return this.repository.delete(id);
  }
}
