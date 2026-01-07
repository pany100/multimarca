import { InventoryPort } from "@/core/domain/ports/inventory.port";
import { CustomFileRepository } from "@/core/domain/repositories/custom-file.repository";
import {
  OrdenReparacionRepository,
  OrdenReparacionWithRelations,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { CustomFile, OrdenReparacion, Prisma } from "@prisma/client";
import { OrdenReparacionDBMapper } from "../mapper/orden-reparacion-db.mapper";
import { StockManagerService } from "./stock-manager.service";
import logger from "@/lib/logger";

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
    logger.info(`[SERVICE DELETE] Iniciando eliminación de orden`, { ordenId: id });
    
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Orden de reparación no encontrada");
    
    logger.info(`[SERVICE DELETE] Orden encontrada`, {
      ordenId: existing.id,
      repuestosCount: existing.repuestosUsados?.length ?? 0,
      tercerosCount: existing.reparacionesDeTercero?.length ?? 0,
      trabajosCount: existing.trabajosRealizados?.length ?? 0,
      mecanicosCount: existing.mecanicos?.length ?? 0,
      ingresosCount: existing.ingresosPorReparacion?.length ?? 0
    });
    
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );

    // Generar acciones de stock para liberar repuestos
    const stockActions = this.stockManager.generateReleaseActions(repuestos);
    logger.info(`[SERVICE DELETE] Acciones de stock generadas`, {
      ordenId: id,
      stockActionsCount: stockActions.length
    });

    await this.inventory.restoreStock(stockActions, { tx });
    logger.info(`[SERVICE DELETE] Stock restaurado`, { ordenId: id });
    
    await this.repo.delete(tx, id);
    logger.info(`[SERVICE DELETE] Orden eliminada exitosamente`, { ordenId: id });

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

    const updateData =
      OrdenReparacionDBMapper.transformToUpdateData(ordenReparacionVO);

    const updated = await this.repo.update(tx, updateData);
    await this.inventory.syncStockAndNotify(stockActions, { tx });
    await this.updateFilesReferences(existingOrder, { tx });
    return updated;
  }

  private async updateFilesReferences(
    existingOrder: {
      scannerFile: CustomFile | null;
      recibosFiles: CustomFile[] | null;
    },
    { tx }: any
  ) {
    const existingScannerFile = existingOrder.scannerFile;
    const existingRecibos = existingOrder.recibosFiles;
    const scannerFileId = existingScannerFile?.id;
    if (scannerFileId) {
      await this.customFileRepo.markAsDeleted(Number(scannerFileId), {
        tx,
      });
    }
    if (existingRecibos && existingRecibos.length > 0) {
      await Promise.all(
        existingRecibos.map((r) =>
          this.customFileRepo.markAsDeleted(Number(r.id), {
            tx,
          })
        )
      );
    }
  }
}
