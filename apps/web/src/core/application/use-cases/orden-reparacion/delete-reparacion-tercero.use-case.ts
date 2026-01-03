import type { DeleteReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";

export class DeleteReparacionTerceroUseCase {
  constructor(private readonly repo: ReparacionTerceroRepository) {}

  async execute(input: DeleteReparacionTerceroDto) {
    return this.repo.delete(input.id);
  }
}
