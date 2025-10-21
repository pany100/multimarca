import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";

export class GetPresupuestoUseCase {
  constructor(private readonly repo: PresupuestoRepository) {}

  async execute(id: number) {
    const presupuesto = await this.repo.findById(id);

    if (!presupuesto) {
      throw new Error("Presupuesto not found");
    }

    const reparacionesDeTercero = presupuesto.reparacionesDeTercero.map(
      (el) => ({
        ...el,
        recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
      })
    );
    const comprobanteCalculado =
      ComprobanteCalculadoFactory.fromPresupuesto(presupuesto);

    return {
      ...presupuesto,
      reparacionesDeTercero,
      total: comprobanteCalculado.total,
    };
  }
}
