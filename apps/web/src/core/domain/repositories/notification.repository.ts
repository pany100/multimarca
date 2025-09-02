import { TipoNotificacionInterna } from "@prisma/client";

export type NotificationData = {
  fecha: Date;
  titulo: string;
  texto: string;
  leida: boolean;
  ordenReparacionId?: number;
  tipo: TipoNotificacionInterna;
  stockId?: number;
};

export interface NotificationRepository {
  create(data: NotificationData, deps?: { tx?: any }): Promise<any>;
  findByOrderIdAndType(id: number, tipo: TipoNotificacionInterna): Promise<any>;
}
