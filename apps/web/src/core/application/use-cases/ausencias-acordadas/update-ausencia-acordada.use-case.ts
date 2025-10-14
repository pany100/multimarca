import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { UpdateAusenciaProgramadaSchema } from "@/core/infrastructure/validation/schemas/ausencia.schema";
import { AusenciaProgramada } from "@prisma/client";

export class UpdateAusenciaAcordadaUseCase {
  constructor(
    private readonly ausenciaProgramadaRepository: AusenciaProgramadaRepository
  ) {}

  async execute(
    id: number,
    data: UpdateAusenciaProgramadaSchema
  ): Promise<AusenciaProgramada | null> {
    return this.ausenciaProgramadaRepository.update(data);
  }
}
