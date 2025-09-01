import {
  CustomFileInput,
  CustomFileRepository,
  CustomFileUpdateInput,
} from "@/core/domain/repositories/custom-file.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { CustomFile } from "@prisma/client";

export class PrismaCustomFileRepository implements CustomFileRepository {
  create(file: CustomFileInput): Promise<CustomFile> {
    return prisma.customFile.create({ data: file });
  }

  update(
    file: CustomFileUpdateInput,
    deps?: { tx?: any }
  ): Promise<CustomFile> {
    const db = deps?.tx?.tx ?? deps?.tx ?? prisma;
    return db.customFile.update({ where: { id: file.id }, data: file });
  }
}
