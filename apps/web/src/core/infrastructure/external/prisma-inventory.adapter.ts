import { NotificationService } from "@/core/application/services/notification.service";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import {
  StockAction,
  StockActionType,
} from "@/core/domain/value-objects/stock-action.vo";
import { TipoNotificacionInterna } from "@prisma/client";

export class PrismaInventoryAdapter implements InventoryPort {
  constructor(private readonly notificationService: NotificationService) {}
  async ensureSufficient(stockActions: StockAction[], deps?: { tx?: any }) {
    const db =
      deps?.tx?.tx ??
      deps?.tx ??
      (await import("@/core/infrastructure/database/prisma")).prisma;

    // Filtrar solo las acciones de tipo TAKE
    const takeActions = stockActions.filter(
      (action) => action.accion === StockActionType.TAKE
    );

    for (const action of takeActions) {
      const stock = await db.stock.findUnique({
        where: { id: action.stockId },
        select: { units: true, name: true },
      });
      if (!stock || (stock.units ?? 0) < action.cantidad) {
        const name = stock?.name ?? String(action.stockId);
        throw new Error(`Stock insuficiente para ${name}`);
      }
    }
  }

  async consumeAndNotify(stockActions: StockAction[], deps?: { tx?: any }) {
    const db =
      deps?.tx?.tx ??
      deps?.tx ??
      (await import("@/core/infrastructure/database/prisma")).prisma;

    // Filtrar solo las acciones de tipo TAKE
    const takeActions = stockActions.filter(
      (action) => action.accion === StockActionType.TAKE
    );

    for (const action of takeActions) {
      const updated = await db.stock.update({
        where: { id: action.stockId },
        data: { units: { decrement: action.cantidad } },
      });
      if ((updated.units ?? 0) <= (updated.restockValue ?? 0)) {
        await this.notificationService.create(
          {
            fecha: new Date(),
            titulo: `${updated.name} necesita reposición`,
            texto: `El elemento ${updated.name} quedó con ${updated.units} unidades. Necesita reponer stock.`,
            leida: false,
            tipo: TipoNotificacionInterna.REPOSICION_STOCK,
            stockId: updated.id,
          },
          { tx: db }
        );
      }
    }
  }

  async restoreStock(stockActions: StockAction[], deps?: { tx?: any }) {
    const prisma = (await import("@/core/infrastructure/database/prisma"))
      .prisma;
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;

    // Filtrar solo las acciones de tipo RELEASE
    const releaseActions = stockActions.filter(
      (action) => action.accion === StockActionType.RELEASE
    );

    for (const action of releaseActions) {
      await db.stock.update({
        where: { id: action.stockId },
        data: { units: { increment: action.cantidad } },
      });
    }
  }

  async syncStockAndNotify(stockActions: StockAction[], deps?: { tx?: any }) {
    const prisma = (await import("@/core/infrastructure/database/prisma"))
      .prisma;
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    await this.restoreStock(stockActions, { tx: db });
    await this.consumeAndNotify(stockActions, { tx: db });
  }
}
