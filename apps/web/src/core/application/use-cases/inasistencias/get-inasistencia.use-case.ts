import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";

export class GetInasistenciaUseCase {
  constructor(private readonly repository: InasistenciaRepository) {}

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
