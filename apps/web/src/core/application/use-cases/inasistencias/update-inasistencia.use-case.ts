import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";
import { UpdateInasistenciaData } from "@/core/infrastructure/validation/schemas/inasistencia.schema";

export class UpdateInasistenciaUseCase {
  constructor(private readonly repository: InasistenciaRepository) {}

  async execute(data: UpdateInasistenciaData) {
    return this.repository.update(data);
  }
}
