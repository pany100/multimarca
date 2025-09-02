import { InventoryPort } from "@/core/domain/ports/inventory.port";
import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { VentaVO } from "@/core/domain/value-objects/venta.vo";
import { EstadoVenta } from "@prisma/client";
import { mapVentaVOToPrismaCreate } from "../mapper/venta-prisma.mapper";
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
}
