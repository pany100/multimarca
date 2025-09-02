import {
  NotificationData,
  NotificationRepository,
} from "@/core/domain/repositories/notification.repository";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
import { TipoNotificacionInterna } from "@prisma/client";

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async findByOrderIdAndType(orderId: number, type: TipoNotificacionInterna) {
    return this.repo.findByOrderIdAndType(orderId, type);
  }

  async create(notification: NotificationData, deps?: { tx?: any }) {
    await this.repo.create(notification, deps);
    const notifier = new SocketNotifier();
    notifier.emit("newNotification");
  }
}
