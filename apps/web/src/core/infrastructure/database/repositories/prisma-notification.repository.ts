import {
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
}
