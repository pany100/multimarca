import {
  CustomFileInput,
  CustomFileRepository,
} from "@/core/domain/repositories/custom-file.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { CustomFile, EstadoArchivo } from "@prisma/client";

export class PrismaCustomFileRepository implements CustomFileRepository {
  create(file: CustomFileInput): Promise<CustomFile> {
    return prisma.customFile.create({ data: file });
  }

  markAsDeleted(id: number, deps?: { tx?: any }): Promise<CustomFile> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.customFile.update({
      where: { id },
      data: {
        status: EstadoArchivo.Borrado,
        ordenReparacionId: null,
        reciboORepId: null,
        reparacionDeTerceroId: null,
      },
    });
  }
}
