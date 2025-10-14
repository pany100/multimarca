import { AusenciaProgramadaRepository } from "@/core/domain/repositories/ausencia-programada.repository";
import { CreateAusenciaProgramadaSchema } from "@/core/infrastructure/validation/schemas/ausencia.schema";
import { AusenciaProgramada } from "@prisma/client";

export class CreateAusenciaAcordadaUseCase {
  constructor(
    private readonly ausenciaProgramadaRepository: AusenciaProgramadaRepository
  ) {}

  async execute(
    data: CreateAusenciaProgramadaSchema
  ): Promise<AusenciaProgramada> {
    return this.ausenciaProgramadaRepository.create(data);
  }
}
