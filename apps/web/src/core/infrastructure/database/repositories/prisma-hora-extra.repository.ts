import { HoraExtraRepository } from "@/core/domain/repositories/hora-extra.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateHoraExtraData,
  UpdateHoraExtraData,
} from "@/core/infrastructure/validation/schemas/hora-extra.schema";
import { HoraExtra } from "@prisma/client";

export class PrismaHoraExtraRepository implements HoraExtraRepository {
  create(data: CreateHoraExtraData): Promise<HoraExtra> {
    return prisma.horaExtra.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        horasTotales: data.horasTotales,
        motivo: data.motivo,
      },
    });
  }

  findById(id: number): Promise<HoraExtra | null> {
    return prisma.horaExtra.findUnique({
      where: { id },
      include: {
        empleado: true,
      },
    });
  }

  update(data: UpdateHoraExtraData): Promise<HoraExtra> {
    return prisma.horaExtra.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha,
        horasTotales: data.horasTotales,
        motivo: data.motivo,
      },
    });
  }

  delete(id: number): Promise<HoraExtra> {
    return prisma.horaExtra.delete({
      where: { id },
    });
  }
}
