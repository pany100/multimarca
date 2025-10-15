import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";

export class DeleteInasistenciaUseCase {
  constructor(private readonly repository: InasistenciaRepository) {}

  async execute(id: number) {
    return this.repository.delete(id);
  }
}
