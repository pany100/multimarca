import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";
import { CreateInasistenciaData } from "@/core/infrastructure/validation/schemas/inasistencia.schema";

export class CreateInasistenciaUseCase {
  constructor(private readonly repository: InasistenciaRepository) {}

  async execute(data: CreateInasistenciaData) {
    return this.repository.create(data);
  }
}
