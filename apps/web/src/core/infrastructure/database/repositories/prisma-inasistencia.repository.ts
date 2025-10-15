import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateInasistenciaData,
  UpdateInasistenciaData,
} from "@/core/infrastructure/validation/schemas/inasistencia.schema";
import { Inasistencia } from "@prisma/client";

export class PrismaInasistenciaRepository implements InasistenciaRepository {
  create(data: CreateInasistenciaData): Promise<Inasistencia> {
    return prisma.inasistencia.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        motivo: data.motivo,
        tipo: data.tipo,
        certificadoMedicoPath: data.certificadoMedicoPath,
      },
    });
  }

  findById(id: number): Promise<Inasistencia | null> {
    return prisma.inasistencia.findUnique({
      where: { id },
      include: {
        empleado: true,
      },
    });
  }

  update(data: UpdateInasistenciaData): Promise<Inasistencia> {
    return prisma.inasistencia.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha,
        motivo: data.motivo,
        tipo: data.tipo,
        certificadoMedicoPath: data.certificadoMedicoPath,
      },
    });
  }

  delete(id: number): Promise<Inasistencia> {
    return prisma.inasistencia.delete({
      where: { id },
    });
  }
}
