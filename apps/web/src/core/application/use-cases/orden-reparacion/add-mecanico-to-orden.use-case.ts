import type { AddMecanicoToOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class AddMecanicoToOrdenUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(input: AddMecanicoToOrdenDto) {
    const orden = await this.repo.findById(input.ordenReparacionId);
    if (!orden) {
      throw new Error("Orden de reparación no encontrada");
    }

    const mecanicoYaAsignado = orden.mecanicos.some(
      (m: any) => m.mecanicoId === input.mecanicoId
    );

    if (mecanicoYaAsignado) {
      throw new Error("El mecánico ya está asignado a esta orden");
    }

    return this.repo.addMecanicoToOrden({
      ordenReparacionId: input.ordenReparacionId,
      mecanicoId: input.mecanicoId,
      detalle: input.detalle,
    });
  }
}
