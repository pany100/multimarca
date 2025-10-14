import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { AusenciaProgramada } from "@prisma/client";

export class GetAusenciaAcordadaUseCase {
  constructor(
    private readonly ausenciaProgramadaRepository: AusenciaProgramadaRepository
  ) {}

  async execute(id: number): Promise<AusenciaProgramada | null> {
    return this.ausenciaProgramadaRepository.get(id);
  }
}
