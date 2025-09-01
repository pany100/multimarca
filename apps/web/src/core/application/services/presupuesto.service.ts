import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";

export class PresupuestoService {
  constructor(private readonly repo: PresupuestoRepository) {}

  async delete(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Presupuesto no encontrado");

    await this.repo.delete(id);
  }
}
