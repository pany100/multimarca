import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import {
  OrdenReparacionRepository,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";

export class DeleteOrdenUseCase {
  constructor(
    private readonly repo: OrdenReparacionRepository,
    private readonly uow: UnitOfWork,
    private readonly inventory: InventoryPort
  ) {}
  async execute(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Orden de reparación no encontrada");
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );
    await this.uow.run(async (tx) => {
      await this.inventory.restoreStock(
        repuestos.map((r: RepuestoUsado) => ({
          stockId: r.stockId,
          units: r.unidadesConsumidas,
        })),
        { tx }
      );
      await this.repo.delete(id);
    });
    return { ok: true };
  }
}
