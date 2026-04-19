import type { AddMecanicoToVentaDto } from "@/core/application/dto/venta.dto";
import type { VentaRepository } from "@/core/domain/repositories/venta.repository";

export class AddMecanicoToVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(input: AddMecanicoToVentaDto) {
    const venta = await this.repo.findById(input.ventaId);
    if (!venta) {
      throw new Error("Venta no encontrada");
    }

    const mecanicoYaAsignado = (venta as any).mecanicos?.some(
      (m: any) => m.mecanicoId === input.mecanicoId
    );

    if (mecanicoYaAsignado) {
      throw new Error("El mecánico ya está asignado a esta venta");
    }

    return this.repo.addMecanicoToVenta(
      input.ventaId,
      input.mecanicoId,
      input.detalle
    );
  }
}
