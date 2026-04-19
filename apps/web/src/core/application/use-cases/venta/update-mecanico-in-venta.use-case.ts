import type { UpdateMecanicoInVentaDto } from "@/core/application/dto/venta.dto";
import type { VentaRepository } from "@/core/domain/repositories/venta.repository";

export class UpdateMecanicoInVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(input: UpdateMecanicoInVentaDto) {
    return this.repo.updateMecanicoInVenta(input.id, input.detalle ?? null);
  }
}
