import { ExchangeRatePort } from "@/core/domain/ports/exchange-rate.port";
import { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { InventoryPort } from "@/core/domain/ports/inventory.port";
import { NotificationRepository } from "@/core/domain/repositories/notification.repository";
import {
  OrdenReparacionRepository,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { PagoMecanicoRepository } from "@/core/domain/repositories/pago-mecanico.repository";
import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { StockAction } from "@/core/domain/value-objects/stock-action.vo";
import { OrdenReparacionDataFactory } from "../factories/orden-reparacion-data.factory";
import { StockManagerService } from "./stock-manager.service";

export class OrdenReparacionService {
  constructor(
    private readonly stockManager: StockManagerService,
    private readonly repo: OrdenReparacionRepository,
    private readonly pagoMecanicoRepo: PagoMecanicoRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly inventory: InventoryPort,
    private readonly files: FileStoragePort,
    private readonly exchange: ExchangeRatePort
  ) {}

  async delete({ tx }: any, id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Orden de reparación no encontrada");
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );

    // Generar acciones de stock para liberar repuestos
    const stockActions = this.stockManager.generateReleaseActions(repuestos);

    await this.inventory.restoreStock(
      repuestos.map((r: RepuestoUsado) => ({
        stockId: r.stockId,
        units: r.unidadesConsumidas,
      })),
      { tx }
    );
    await this.repo.delete(tx, id);

    return stockActions; // Retornar las acciones generadas para logging/auditoría
  }

  async create(
    { tx }: any,
    ordenReparacionVO: OrdenReparacionVO
  ): Promise<{ orden: any; stockActions: StockAction[] }> {
    const stockActions = this.stockManager.generateTakeActions(
      ordenReparacionVO.repuestosVO
    );
    await this.inventory.ensureSufficient(stockActions);

    const createData =
      OrdenReparacionDataFactory.createCreateDataToPersist(ordenReparacionVO);

    const orden = await this.repo.create(tx, createData);

    if (!ordenReparacionVO.estado.isPresupuestado()) {
      await this.inventory.consumeAndNotify(stockActions, { tx });
    }

    if (ordenReparacionVO.estado.isTerminado()) {
      await this.pagoMecanicoRepo.create({ ordenReparacionId: orden.id });
      await this.notificationRepo.create({
        fecha: new Date(),
        titulo: "Reparación Terminada",
        texto: `La reparación del auto ${orden.autoId} se encuentra terminada. Pagar mano de obra.`,
        leida: false,
        ordenReparacionId: orden.id,
        tipo: "REPARACION_TERMINADA",
      });
    }

    return { orden, stockActions };
  }
}
