import type { RecuperacionRepository } from "@/core/domain/repositories/recuperacion.repository";

export class DeleteRecuperacionUseCase {
  constructor(private readonly repo: RecuperacionRepository) {}

  async execute(recuperacionId: number, perdidaId: number) {
    // Check if recuperacion exists and belongs to the correct perdida
    const existingRecuperacion = await this.repo.findById(recuperacionId);
    if (!existingRecuperacion || existingRecuperacion.perdidaId !== perdidaId) {
      throw new Error("Recuperación no encontrada");
    }

    await this.repo.delete(recuperacionId);
    
    return {
      message: "Recuperación eliminada con éxito",
      id: recuperacionId,
    };
  }
}
