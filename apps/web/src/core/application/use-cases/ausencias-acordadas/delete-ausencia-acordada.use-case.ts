import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { AusenciaProgramada } from "@prisma/client";

export class DeleteAusenciaAcordadaUseCase {
  constructor(
    private readonly ausenciaProgramadaRepository: AusenciaProgramadaRepository
  ) {}

  async execute(id: number): Promise<AusenciaProgramada | null> {
    return this.ausenciaProgramadaRepository.delete(id);
  }
}
