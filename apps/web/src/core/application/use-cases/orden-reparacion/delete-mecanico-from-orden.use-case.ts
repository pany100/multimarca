import type { DeleteMecanicoFromOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class DeleteMecanicoFromOrdenUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: DeleteMecanicoFromOrdenDto) {
    return this.repo.deleteMecanicoFromOrden(input.id);
  }
}
