import { ApercibimientoRepository } from "@/core/domain/repositories/apercibimiento.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateApercibimientoData,
  UpdateApercibimientoData,
} from "@/core/infrastructure/validation/schemas/apercibimiento.schema";
import { Apercibimiento } from "@prisma/client";

export class PrismaApercibimientoRepository implements ApercibimientoRepository {
  create(data: CreateApercibimientoData): Promise<Apercibimiento> {
    return prisma.apercibimiento.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        tipo: data.tipo,
        motivo: data.motivo,
      },
    });
  }

  findById(id: number): Promise<Apercibimiento | null> {
    return prisma.apercibimiento.findUnique({
      where: { id },
      include: {
        empleado: true,
      },
    });
  }

  update(data: UpdateApercibimientoData): Promise<Apercibimiento> {
    return prisma.apercibimiento.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha,
        tipo: data.tipo,
        motivo: data.motivo,
      },
    });
  }

  delete(id: number): Promise<Apercibimiento> {
    return prisma.apercibimiento.delete({
      where: { id },
    });
  }
}
