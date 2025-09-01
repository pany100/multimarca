import { InventoryPort } from "@/core/domain/ports/inventory.port";
import { CustomFileRepository } from "@/core/domain/repositories/custom-file.repository";
import {
  OrdenReparacionRepository,
  OrdenReparacionWithRelations,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { EstadoArchivo, OrdenReparacion, Prisma } from "@prisma/client";
import { OrdenReparacionDBMapper } from "../mapper/orden-reparacion-db.mapper";
import { StockManagerService } from "./stock-manager.service";

type OrdenReparacionWithReparaciones = Prisma.OrdenReparacionGetPayload<{
  include: {
    reparacionesDeTercero: { select: { recibo: true } };
  };
}>;

export class OrdenReparacionService {
  constructor(
    private readonly stockManager: StockManagerService,
    private readonly repo: OrdenReparacionRepository,
    private readonly inventory: InventoryPort,
    private readonly customFileRepo: CustomFileRepository
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
  ): Promise<OrdenReparacion> {
    const stockActions = this.stockManager.generateTakeActions(
      ordenReparacionVO.repuestosVO
    );
    await this.inventory.ensureSufficient(stockActions);
    if (ordenReparacionVO.estado.isPresupuestado()) {
      throw new Error("Estado no permitido");
    }
    const createData =
      OrdenReparacionDBMapper.transformToCreateData(ordenReparacionVO);
    const orden = await this.repo.create(tx, createData);

    await this.inventory.consumeAndNotify(stockActions, { tx });

    return orden;
  }

  async update(
    { tx }: any,
    ordenReparacionVO: OrdenReparacionVO
  ): Promise<OrdenReparacionWithRelations> {
    if (!ordenReparacionVO.id) throw new Error("Id es requerido");
    const existingOrder = await this.repo.findById(ordenReparacionVO.id);
    if (!existingOrder) throw new Error("Orden de reparación no encontrada");

    if (ordenReparacionVO.estado.isPresupuestado()) {
      throw new Error("Estado no permitido");
    }

    const existingRepuestosVO = existingOrder.repuestosUsados.map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );
    const stockActions = this.stockManager.generateSyncActions(
      existingRepuestosVO,
      ordenReparacionVO.repuestosVO
    );
    await this.inventory.ensureSufficient(stockActions);

    const existingScannerFile = existingOrder.scannerFile;
    const scannerFileId = existingScannerFile?.id;
    const updateData =
      OrdenReparacionDBMapper.transformToUpdateData(ordenReparacionVO);

    const updated = await this.repo.update(tx, updateData);
    await this.inventory.syncStockAndNotify(stockActions, { tx });
    if (scannerFileId) {
      await this.customFileRepo.update(
        {
          id: Number(scannerFileId),
          status: EstadoArchivo.Borrado,
          ordenReparacionId: null,
        },
        {
          tx,
        }
      );
    }

    return updated;
  }
}
