import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";

export class GetPerdidaUseCase {
  constructor(private readonly repo: PerdidaRepository) {}

  async execute(id: number) {
    const perdida = await this.repo.findById(id);
    
    if (!perdida) {
      throw new Error("Registro de pérdida no encontrado");
    }

    return perdida;
  }
}
