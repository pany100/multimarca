import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";

export class GetManoDeObraByIdUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error("Trabajo de mano de obra no encontrado");
    }
    return item;
  }
}
