import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";

export class DeletePerdidaUseCase {
  constructor(private readonly repo: PerdidaRepository) {}

  async execute(id: number) {
    // Check if perdida exists
    const existingPerdida = await this.repo.findById(id);
    if (!existingPerdida) {
      throw new Error("Registro de pérdida no encontrado");
    }

    await this.repo.delete(id);
    
    return {
      message: "Registro de pérdida eliminado con éxito",
      id,
    };
  }
}
