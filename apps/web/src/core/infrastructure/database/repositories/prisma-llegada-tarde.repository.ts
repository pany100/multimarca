import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateLlegadaTardeData,
  UpdateLlegadaTardeData,
} from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";
import { LlegadaTarde } from "@prisma/client";

export class PrismaLlegadaTardeRepository implements LlegadaTardeRepository {
  create(data: CreateLlegadaTardeData): Promise<LlegadaTarde> {
    return prisma.llegadaTarde.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        minutosRetraso: data.minutosRetraso,
        motivo: data.motivo,
        estado: data.estado,
        certificadoPath: data.certificadoPath,
      },
    });
  }

  findById(id: number): Promise<LlegadaTarde | null> {
    return prisma.llegadaTarde.findUnique({
      where: { id },
      include: {
        empleado: true,
      },
    });
  }

  update(data: UpdateLlegadaTardeData): Promise<LlegadaTarde> {
    return prisma.llegadaTarde.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha,
        minutosRetraso: data.minutosRetraso,
        motivo: data.motivo,
        estado: data.estado,
        certificadoPath: data.certificadoPath,
      },
    });
  }

  delete(id: number): Promise<LlegadaTarde> {
    return prisma.llegadaTarde.delete({
      where: { id },
    });
  }
}
