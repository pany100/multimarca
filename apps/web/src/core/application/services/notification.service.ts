import {
  NotificationData,
  NotificationRepository,
} from "@/core/domain/repositories/notification.repository";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
import { TipoNotificacionInterna } from "@prisma/client";
import { getUsersToNotify } from "@/utils/notificationUtils";

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async findByOrderIdAndType(orderId: number, type: TipoNotificacionInterna) {
    return this.repo.findByOrderIdAndType(orderId, type);
  }

  /**
   * Crea notificación(es). Si no se recibe userId, crea una por cada usuario
   * que puede recibir notificaciones. Nunca se crea con userId null.
   */
  async create(notification: NotificationData, deps?: { tx?: any }) {
    const hasUserId =
      notification.userId != null && notification.userId !== undefined;

    if (hasUserId) {
      await this.repo.create(notification, deps);
    } else {
      const users = await getUsersToNotify();
      for (const user of users) {
        await this.repo.create(
          { ...notification, userId: user.id },
          deps
        );
      }
    }

    const notifier = new SocketNotifier();
    notifier.emit("newNotification");
  }
}
