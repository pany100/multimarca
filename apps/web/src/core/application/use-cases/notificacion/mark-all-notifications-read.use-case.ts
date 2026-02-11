import { NotificationService } from "@/core/application/services/notification.service";

export type MarkAllNotificationsReadInput = {
  userId: number;
};

export class MarkAllNotificationsAsReadUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async execute(input: MarkAllNotificationsReadInput) {
    return this.notificationService.markAllAsRead(input.userId);
  }
}
