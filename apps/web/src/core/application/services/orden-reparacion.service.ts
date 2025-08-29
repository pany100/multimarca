import { InventoryPort } from "@/core/domain/ports/inventory.port";
import {
  OrdenReparacionRepository,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";

export class OrdenReparacionService {
  constructor(
    private readonly repo: OrdenReparacionRepository,
    private readonly inventory: InventoryPort
  ) {}

  async delete({ tx }: any, id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Orden de reparación no encontrada");
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );
    await this.inventory.restoreStock(
      repuestos.map((r: RepuestoUsado) => ({
        stockId: r.stockId,
        units: r.unidadesConsumidas,
      })),
      { tx }
    );
    await this.repo.delete(tx, id);
  }
}
