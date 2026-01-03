import type { DeleteRepuestoUsadoDto } from "@/core/application/dto/orden-reparacion.dto";
import type { RepuestoUsadoRepository } from "@/core/domain/repositories/repuesto-usado.repository";

export class DeleteRepuestoUsadoUseCase {
  constructor(private readonly repo: RepuestoUsadoRepository) {}

  async execute(input: DeleteRepuestoUsadoDto) {
    return this.repo.delete(input.id);
  }
}
