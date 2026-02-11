import {
  ListNotificationsByUserParams,
  ListNotificationsByUserResult,
  NotificationData,
  NotificationRepository,
} from "@/core/domain/repositories/notification.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { TipoNotificacionInterna } from "@prisma/client";

export class PrismaNotificationRepository implements NotificationRepository {
  create(data: NotificationData, deps?: { tx?: any }): Promise<any> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.notificacionInterna.create({ data });
  }
  findByOrderIdAndType(
    id: number,
    tipo: TipoNotificacionInterna
  ): Promise<any> {
    return prisma.notificacionInterna.findFirst({
      where: {
        ordenReparacionId: id,
        tipo,
      },
    });
  }

  async markAllAsReadByUserId(
    userId: number,
    deps?: { tx?: any }
  ): Promise<{ count: number }> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    const result = await db.notificacionInterna.updateMany({
      where: {
        userId,
        leida: false,
      },
      data: { leida: true },
    });
    return { count: result.count };
  }

  async findByUserId(
    params: ListNotificationsByUserParams,
    deps?: { tx?: any }
  ): Promise<ListNotificationsByUserResult> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    const { userId, page, size, leidas } = params;
    const skip = page * size;

    const where = {
      userId,
      ...(leidas !== null ? { leida: leidas } : {}),
    };

    const [items, total] = await Promise.all([
      db.notificacionInterna.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "desc" },
      }),
      db.notificacionInterna.count({ where }),
    ]);

    return { items, total };
  }
}
