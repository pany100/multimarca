import type { AddReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";

export class AddReparacionTerceroUseCase {
  constructor(
    private readonly repo: ReparacionTerceroRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: AddReparacionTerceroDto) {
    return this.uow.run(async (deps) => {
      return this.repo.add(
        {
          ordenReparacionId: input.ordenReparacionId,
          nombre: input.nombre,
          proveedorId: input.proveedorId,
          precioCompra: input.precioCompra,
          precioVenta: input.precioVenta,
          recibo: input.recibo,
        },
        deps
      );
    });
  }
}
