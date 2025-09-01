import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";

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

    return {
      ...presupuesto,
      reparacionesDeTercero,
    };
  }
}
