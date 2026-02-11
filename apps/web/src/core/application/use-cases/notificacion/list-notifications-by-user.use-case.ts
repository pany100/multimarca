import { NotificationService } from "@/core/application/services/notification.service";
import { ListNotificationsByUserParams } from "@/core/domain/repositories/notification.repository";

export type ListNotificationsByUserInput = ListNotificationsByUserParams;

export type ListNotificationsByUserOutput = {
  items: any[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

export class ListNotificationsByUserUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async execute(
    input: ListNotificationsByUserInput
  ): Promise<ListNotificationsByUserOutput> {
    const { items, total } = await this.notificationService.listByUser(input);
    const { page, size } = input;
    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}
