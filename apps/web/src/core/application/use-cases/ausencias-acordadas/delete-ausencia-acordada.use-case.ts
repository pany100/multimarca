import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { AusenciaProgramada } from "@prisma/client";

export class DeleteAusenciaAcordadaUseCase {
  constructor(
    private readonly ausenciaProgramadaRepository: AusenciaProgramadaRepository
  ) {}

  async execute(id: number): Promise<AusenciaProgramada | null> {
    const deleted = await this.ausenciaProgramadaRepository.delete(id);
    if (!deleted) {
      throw new Error("Ausencia acordada no encontrada");
    }
    return deleted;
  }
}
