import type { DeleteTrabajoRealizadoDto } from "@/core/application/dto/trabajo-realizado.dto";
import type { TrabajoRealizadoRepository } from "@/core/domain/repositories/trabajo-realizado.repository";

export class DeleteTrabajoRealizadoUseCase {
  constructor(private readonly repo: TrabajoRealizadoRepository) {}

  async execute(input: DeleteTrabajoRealizadoDto) {
    return this.repo.delete(input.id);
  }
}
