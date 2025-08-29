import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import { TipoNotificacionInterna } from "@prisma/client";

export class PrismaInventoryAdapter implements InventoryPort {
  async ensureSufficient(
    items: Array<{ stockId: number; units: number; name?: string }>,
    deps?: { tx?: any }
  ) {
    const db =
      deps?.tx?.tx ??
      deps?.tx ??
      (await import("@/core/infrastructure/database/prisma")).prisma;
    for (const it of items) {
      const stock = await db.stock.findUnique({
        where: { id: it.stockId },
        select: { units: true, name: true },
      });
      if (!stock || (stock.units ?? 0) < it.units) {
        const n = it.name ?? stock?.name ?? String(it.stockId);
        throw new Error(`Stock insuficiente para ${n}`);
      }
    }
  }

  async consumeAndNotify(
    items: Array<{ stockId: number; units: number }>,
    deps?: { tx?: any }
  ) {
    const db =
      deps?.tx?.tx ??
      deps?.tx ??
      (await import("@/core/infrastructure/database/prisma")).prisma;
    for (const it of items) {
      const updated = await db.stock.update({
        where: { id: it.stockId },
        data: { units: { decrement: it.units } },
      });
      if ((updated.units ?? 0) <= (updated.restockValue ?? 0)) {
        await db.notificacionInterna.create({
          data: {
            fecha: new Date(),
            titulo: `${updated.name} necesita reposición`,
            texto: `El elemento ${updated.name} quedó con ${updated.units} unidades. Necesita reponer stock.`,
            leida: false,
            tipo: TipoNotificacionInterna.REPOSICION_STOCK,
            stockId: updated.id,
          },
        });
      }
    }
  }

  async restoreStock(
    items: Array<{ stockId: number; units: number }>,
    deps?: { tx?: any }
  ) {
    const prisma = (await import("@/core/infrastructure/database/prisma"))
      .prisma;
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;

    for (const it of items) {
      await db.stock.update({
        where: { id: it.stockId },
        data: { units: { increment: it.units } },
      });
    }
  }
}
