import { InventoryPort } from "@/core/domain/ports/inventory.port";
import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { VentaVO } from "@/core/domain/value-objects/venta.vo";
import { EstadoVenta } from "@prisma/client";
import {
  mapVentaVOToPrismaCreate,
  mapVentaVOToPrismaUpdate,
} from "../mapper/venta-prisma.mapper";
import { StockManagerService } from "./stock-manager.service";

export class VentaService {
  constructor(
    private readonly repo: VentaRepository,
    private readonly inventory: InventoryPort,
    private readonly stockManager: StockManagerService
  ) {}

  async create({ tx }: any, ventaVO: VentaVO) {
    const stockActions = this.stockManager.generateTakeActions(
      ventaVO.repuestosVO
    );
    if (ventaVO.estado !== EstadoVenta.Presupuestado) {
      await this.inventory.ensureSufficient(stockActions);
    }
    const createData = mapVentaVOToPrismaCreate(ventaVO);
    const venta = await this.repo.create(tx, createData);
    if (ventaVO.estado !== EstadoVenta.Presupuestado) {
      await this.inventory.consumeAndNotify(stockActions, { tx });
    }
    return venta;
  }

  async delete({ tx }: any, id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Venta no encontrada");
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );

    // Generar acciones de stock para liberar repuestos
    const stockActions = this.stockManager.generateReleaseActions(repuestos);

    await this.inventory.restoreStock(stockActions, { tx });
    await this.repo.delete(tx, id);

    return stockActions;
  }

  async update({ tx }: any, ventaVO: VentaVO) {
    if (!ventaVO.id) {
      throw new Error("ID de venta no proporcionado");
    }
    const existing = await this.repo.findById(ventaVO.id);
    if (!existing) {
      throw new Error("Venta no encontrada");
    }

    if (
      ventaVO.estado === EstadoVenta.Presupuestado &&
      existing.estado !== EstadoVenta.Presupuestado
    ) {
      throw new Error("No se puede convertir una venta a presupuesto");
    }

    const existingRepuestos = (existing.repuestosUsados ?? []).map(
      (r): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );
    const stockActions = this.stockManager.generateSyncActions(
      existingRepuestos,
      ventaVO.repuestosVO
    );
    if (ventaVO.estado !== EstadoVenta.Presupuestado) {
      await this.inventory.ensureSufficient(stockActions);
    }

    const updateData = mapVentaVOToPrismaUpdate(ventaVO);
    const venta = await this.repo.update(tx, updateData);
    if (ventaVO.estado !== EstadoVenta.Presupuestado) {
      await this.inventory.syncStockAndNotify(stockActions, { tx });
    }
    return venta;
  }
}
