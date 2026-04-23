import { LlegadaTardeRepository } from "@/core/domain/repositories/llegada-tarde.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateLlegadaTardeData,
  UpdateLlegadaTardeData,
} from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";
import { assertTempPathInTmp } from "@/shared/utils/custom-file.helper";
import { EstadoArchivo, LlegadaTarde } from "@prisma/client";

export class PrismaLlegadaTardeRepository implements LlegadaTardeRepository {
  async create(data: CreateLlegadaTardeData): Promise<LlegadaTarde> {
    const created = await prisma.llegadaTarde.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha,
        minutosRetraso: data.minutosRetraso,
        motivo: data.motivo,
        estado: data.estado,
      },
    });
    if (data.certificadoPath != null && data.certificadoPath !== "") {
      assertTempPathInTmp(data.certificadoPath);
      await prisma.customFile.create({
        data: {
          tempPath: data.certificadoPath,
          llegadaTardeCertificadoId: created.id,
        },
      });
    }
    return this.findById(created.id) as Promise<LlegadaTarde>;
  }

  findById(id: number): Promise<LlegadaTarde | null> {
    return prisma.llegadaTarde.findUnique({
      where: { id },
      include: {
        empleado: true,
        certificadoPath: true,
      },
    });
  }

  async update(data: UpdateLlegadaTardeData): Promise<LlegadaTarde> {
    const id = data.id;
    const existingFile = await prisma.customFile.findFirst({
      where: { llegadaTardeCertificadoId: id },
      select: { id: true, tempPath: true, finalPath: true },
    });
    const hasPath = data.certificadoPath != null && data.certificadoPath !== "";
    const currentPath = existingFile
      ? existingFile.finalPath ?? existingFile.tempPath
      : null;
    const sameFile = hasPath && data.certificadoPath === currentPath;

    if (!sameFile) {
      if (existingFile) {
        await prisma.customFile.update({
          where: { id: existingFile.id },
          data: {
            llegadaTardeCertificadoId: null,
            status: EstadoArchivo.ListoParaBorrar,
          },
        });
      }
      if (hasPath) {
        assertTempPathInTmp(data.certificadoPath!);
        await prisma.customFile.create({
          data: {
            tempPath: data.certificadoPath!,
            llegadaTardeCertificadoId: id,
          },
        });
      }
    }
    await prisma.llegadaTarde.update({
      where: { id },
      data: {
        fecha: data.fecha,
        minutosRetraso: data.minutosRetraso,
        motivo: data.motivo,
        estado: data.estado,
      },
    });
    return this.findById(id) as Promise<LlegadaTarde>;
  }

  async delete(id: number): Promise<LlegadaTarde> {
    const existingFile = await prisma.customFile.findFirst({
      where: { llegadaTardeCertificadoId: id },
      select: { id: true },
    });
    if (existingFile) {
      await prisma.customFile.update({
        where: { id: existingFile.id },
        data: {
          llegadaTardeCertificadoId: null,
          status: EstadoArchivo.ListoParaBorrar,
        },
      });
    }
    return prisma.llegadaTarde.delete({
      where: { id },
    });
  }
}
