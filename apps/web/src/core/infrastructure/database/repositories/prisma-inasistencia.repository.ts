import { InasistenciaRepository } from "@/core/domain/repositories/inasistencia.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateInasistenciaData,
  UpdateInasistenciaData,
} from "@/core/infrastructure/validation/schemas/inasistencia.schema";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { EstadoArchivo, Inasistencia } from "@prisma/client";

export class PrismaInasistenciaRepository implements InasistenciaRepository {
  async create(data: CreateInasistenciaData): Promise<Inasistencia> {
    const created = await prisma.inasistencia.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        motivo: data.motivo,
        tipo: data.tipo,
      },
    });
    if (data.certificadoMedicoPath != null && data.certificadoMedicoPath !== "") {
      assertTempPathInTmp(data.certificadoMedicoPath);
      await prisma.customFile.create({
        data: {
          tempPath: data.certificadoMedicoPath,
          inasistenciaCertificadoId: created.id,
        },
      });
    }
    return this.findById(created.id) as Promise<Inasistencia>;
  }

  findById(id: number): Promise<Inasistencia | null> {
    return prisma.inasistencia.findUnique({
      where: { id },
      include: {
        empleado: true,
        certificadoMedicoPath: true,
      },
    });
  }

  async update(data: UpdateInasistenciaData): Promise<Inasistencia> {
    const id = data.id;
    const existingFile = await prisma.customFile.findFirst({
      where: { inasistenciaCertificadoId: id },
      select: { id: true, tempPath: true, finalPath: true },
    });
    const hasPath =
      data.certificadoMedicoPath != null && data.certificadoMedicoPath !== "";
    const currentPath = existingFile
      ? existingFile.finalPath ?? existingFile.tempPath
      : null;
    const sameFile = hasPath && data.certificadoMedicoPath === currentPath;

    if (!sameFile) {
      if (existingFile) {
        await prisma.customFile.update({
          where: { id: existingFile.id },
          data: {
            inasistenciaCertificadoId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
      if (hasPath) {
        assertTempPathInTmp(data.certificadoMedicoPath!);
        await prisma.customFile.create({
          data: {
            tempPath: data.certificadoMedicoPath!,
            inasistenciaCertificadoId: id,
          },
        });
      }
    }
    await prisma.inasistencia.update({
      where: { id },
      data: {
        fecha: data.fecha,
        motivo: data.motivo,
        tipo: data.tipo,
      },
    });
    return this.findById(id) as Promise<Inasistencia>;
  }

  async delete(id: number): Promise<Inasistencia> {
    const existingFile = await prisma.customFile.findFirst({
      where: { inasistenciaCertificadoId: id },
      select: { id: true },
    });
    if (existingFile) {
      await prisma.customFile.update({
        where: { id: existingFile.id },
        data: {
          inasistenciaCertificadoId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }
    return prisma.inasistencia.delete({
      where: { id },
    });
  }
}
