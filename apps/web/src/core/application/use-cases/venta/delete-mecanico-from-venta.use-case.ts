import type { DeleteMecanicoFromVentaDto } from "@/core/application/dto/venta.dto";
import type { VentaRepository } from "@/core/domain/repositories/venta.repository";

export class DeleteMecanicoFromVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(input: DeleteMecanicoFromVentaDto) {
    return this.repo.deleteMecanicoFromVenta(input.id);
  }
}
