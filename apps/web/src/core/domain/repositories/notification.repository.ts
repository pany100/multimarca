import { TipoNotificacionInterna } from "@prisma/client";

export type NotificationData = {
  fecha: Date;
  titulo: string;
  texto: string;
  leida: boolean;
  ordenReparacionId?: number;
  tipo: TipoNotificacionInterna;
  stockId?: number;
  userId?: number | null;
};

export type ListNotificationsByUserParams = {
  userId: number;
  page: number;
  size: number;
  leidas: boolean | null;
};

export type ListNotificationsByUserResult = {
  items: any[];
  total: number;
};

export interface NotificationRepository {
  create(data: NotificationData, deps?: { tx?: any }): Promise<any>;
  findByOrderIdAndType(id: number, tipo: TipoNotificacionInterna): Promise<any>;
  markAllAsReadByUserId(
    userId: number,
    deps?: { tx?: any }
  ): Promise<{ count: number }>;
  findByUserId(
    params: ListNotificationsByUserParams,
    deps?: { tx?: any }
  ): Promise<ListNotificationsByUserResult>;
}
