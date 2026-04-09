import type { AddTrabajoRealizadoDto } from "@/core/application/dto/trabajo-realizado.dto";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { TrabajoRealizadoRepository } from "@/core/domain/repositories/trabajo-realizado.repository";

export class AddTrabajoRealizadoUseCase {
  constructor(
    private readonly repo: TrabajoRealizadoRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: AddTrabajoRealizadoDto) {
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
          precioUnitario: input.precioUnitario,
          descripcion: input.descripcion,
          diasParaRecordatorio: input.diasParaRecordatorio,
          pdfName: input.pdfName,
          iva: input.iva,
        },
        deps
      );
    });
  }
}
