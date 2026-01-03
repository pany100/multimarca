import type { UpdateReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class UpdateReparacionTerceroUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: UpdateReparacionTerceroDto) {
    return this.repo.updateReparacionTercero(input.id, {
      nombre: input.nombre,
      proveedorId: input.proveedorId,
      precioCompra: input.precioCompra,
      precioVenta: input.precioVenta,
      recibo: input.recibo,
    });
  }
}
