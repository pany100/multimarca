import type { AddReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class AddReparacionTerceroUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: AddReparacionTerceroDto) {
    return this.repo.addReparacionTercero({
      ordenReparacionId: input.ordenReparacionId,
      nombre: input.nombre,
      proveedorId: input.proveedorId,
      precioCompra: input.precioCompra,
      precioVenta: input.precioVenta,
      recibo: input.recibo,
    });
  }
}
