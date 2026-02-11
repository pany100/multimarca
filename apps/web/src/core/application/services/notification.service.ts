import {
  ListNotificationsByUserParams,
  ListNotificationsByUserResult,
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
   * Lista notificaciones del usuario. Solo las que tienen userId igual al indicado.
   */
  async listByUser(
    params: ListNotificationsByUserParams,
    deps?: { tx?: any }
  ): Promise<ListNotificationsByUserResult> {
    return this.repo.findByUserId(params, deps);
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

  /**
   * Marca como leídas todas las notificaciones del usuario.
   * Solo afecta las que tienen userId igual al indicado.
   */
  async markAllAsRead(userId: number, deps?: { tx?: any }) {
    const { count } = await this.repo.markAllAsReadByUserId(userId, deps);
    if (count > 0) {
      const notifier = new SocketNotifier();
      notifier.emit("readNotification");
    }
    return { count };
  }
}
