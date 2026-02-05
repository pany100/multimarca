import type { UpdateTrabajoRealizadoDto } from "@/core/application/dto/trabajo-realizado.dto";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { TrabajoRealizadoRepository } from "@/core/domain/repositories/trabajo-realizado.repository";

export class UpdateTrabajoRealizadoUseCase {
  constructor(
    private readonly repo: TrabajoRealizadoRepository,
    private readonly uow: UnitOfWork
  ) {}

  async execute(input: UpdateTrabajoRealizadoDto) {
    return this.uow.run(async (deps) => {
      return this.repo.update(
        input.id,
        {
          precioUnitario: input.precioUnitario,
          descripcion: input.descripcion,
          diasParaRecordatorio: input.diasParaRecordatorio,
          pdfName: input.pdfName,
        },
        deps
      );
    });
  }
}
