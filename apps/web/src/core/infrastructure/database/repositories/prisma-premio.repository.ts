import { PremioRepository } from "@/core/domain/repositories/premio.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreatePremioData,
  UpdatePremioData,
} from "@/core/infrastructure/validation/schemas/premio.schema";
import { Premio } from "@prisma/client";

export class PrismaPremioRepository implements PremioRepository {
  create(data: CreatePremioData): Promise<Premio> {
    return prisma.premio.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        tipo: data.tipo,
        descripcion: data.descripcion,
        monto: data.monto,
      },
    });
  }

  findById(id: number): Promise<Premio | null> {
    return prisma.premio.findUnique({
      where: { id },
      include: {
        empleado: true,
      },
    });
  }

  update(data: UpdatePremioData): Promise<Premio> {
    return prisma.premio.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha,
        tipo: data.tipo,
        descripcion: data.descripcion,
        monto: data.monto,
      },
    });
  }

  delete(id: number): Promise<Premio> {
    return prisma.premio.delete({
      where: { id },
    });
  }
}
