import type { DeleteReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class DeleteReparacionTerceroUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: DeleteReparacionTerceroDto) {
    return this.repo.deleteReparacionTercero(input.id);
  }
}
