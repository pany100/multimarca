import type { AddReparacionTerceroDto } from "@/core/application/dto/orden-reparacion.dto";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { ReparacionTerceroRepository } from "@/core/domain/repositories/reparacion-tercero.repository";

export class AddReparacionTerceroUseCase {
  constructor(
    private readonly repo: ReparacionTerceroRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: AddReparacionTerceroDto) {
    // Validate that exactly one parent ID is provided
    const parentIds = [
      input.ordenReparacionId,
      input.ventaId,
      input.presupuestoId,
    ].filter((id) => id !== undefined && id !== null);

    if (parentIds.length !== 1) {
      throw new Error(
        "Debe proporcionar exactamente uno de: ordenReparacionId, ventaId, o presupuestoId"
      );
    }

    return this.uow.run(async (deps) => {
      return this.repo.add(
        {
          ordenReparacionId: input.ordenReparacionId,
          ventaId: input.ventaId,
          presupuestoId: input.presupuestoId,
          nombre: input.nombre,
          proveedorId: input.proveedorId,
          cantidad: input.cantidad,
          mostrarCantidadEnPdf: input.mostrarCantidadEnPdf,
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
