import {
  NotificationData,
  NotificationRepository,
} from "@/core/domain/repositories/notification.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaNotificationRepository implements NotificationRepository {
  create(data: NotificationData): Promise<any> {
    return prisma.notificacionInterna.create({ data });
  }
}
