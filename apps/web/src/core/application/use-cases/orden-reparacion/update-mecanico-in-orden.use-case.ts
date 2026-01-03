import type { UpdateMecanicoInOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class UpdateMecanicoInOrdenUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: UpdateMecanicoInOrdenDto) {
    return this.repo.updateMecanicoInOrden(input.id, input.detalle ?? null);
  }
}
