import type { UpdateReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";

export class UpdateReparacionTerceroUseCase {
  constructor(
    private readonly repo: ReparacionTerceroRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: UpdateReparacionTerceroDto) {
    return this.uow.run(async (deps) => {
      return this.repo.update(
        input.id,
        {
          nombre: input.nombre,
          proveedorId: input.proveedorId,
          cantidad: input.cantidad,
          precioCompra: input.precioCompra,
          precioVenta: input.precioVenta,
          iva: input.iva,
          buyIva: input.buyIva,
          markup: input.markup,
          recibo: input.recibo,
        },
        deps
      );
    });
  }
}
