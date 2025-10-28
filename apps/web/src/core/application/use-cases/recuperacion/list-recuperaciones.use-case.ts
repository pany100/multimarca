import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";
import type { RecuperacionRepository } from "@/core/domain/repositories/recuperacion.repository";

export class ListRecuperacionesUseCase {
  constructor(
    private readonly recuperacionRepo: RecuperacionRepository,
    private readonly perdidaRepo: PerdidaRepository
  ) {}

  async execute(perdidaId: number) {
    // Validate that the perdida exists
    const perdida = await this.perdidaRepo.findById(perdidaId);
    if (!perdida) {
      throw new Error("Registro de pérdida no encontrado");
    }

    const recuperaciones = await this.recuperacionRepo.findByPerdidaId(perdidaId);
    return recuperaciones;
  }
}
