import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { PresupuestoVO } from "@/core/domain/value-objects/presupuesto.vo";
import { PresupuestoDBMapper } from "../mapper/presupuesto-db.mapper";

export class PresupuestoService {
  constructor(private readonly repo: PresupuestoRepository) {}

  async delete(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Presupuesto no encontrado");

    await this.repo.delete(id);
  }

  async update(presupuestoVO: PresupuestoVO) {
    if (!presupuestoVO.id) {
      throw new Error("Id es requerido");
    }

    const presupuestoDB =
      PresupuestoDBMapper.transformToUpdateData(presupuestoVO);
    return await this.repo.update(presupuestoDB);
  }
}
