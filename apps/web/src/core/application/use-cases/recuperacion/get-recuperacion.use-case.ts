import type { RecuperacionRepository } from "@/core/domain/repositories/recuperacion.repository";

export class GetRecuperacionUseCase {
  constructor(private readonly repo: RecuperacionRepository) {}

  async execute(recuperacionId: number, perdidaId: number) {
    const recuperacion = await this.repo.findById(recuperacionId);
    
    if (!recuperacion || recuperacion.perdidaId !== perdidaId) {
      throw new Error("Recuperación no encontrada");
    }

    return recuperacion;
  }
}
