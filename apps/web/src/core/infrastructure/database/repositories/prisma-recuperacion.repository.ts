import type {
  CreateRecuperacionPersist,
  RecuperacionRepository,
  RecuperacionWithRelations,
  UpdateRecuperacionPersist,
} from "@/core/domain/repositories/recuperacion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaRecuperacionRepository implements RecuperacionRepository {
  async findByPerdidaId(perdidaId: number): Promise<RecuperacionWithRelations[]> {
    return await prisma.recuperacion.findMany({
      where: { perdidaId },
      orderBy: { fecha: "desc" },
    });
  }

  async findById(id: number): Promise<RecuperacionWithRelations | null> {
    return await prisma.recuperacion.findUnique({
      where: { id },
    });
  }

  async create({
    data,
  }: CreateRecuperacionPersist): Promise<RecuperacionWithRelations> {
    return await prisma.recuperacion.create(data);
  }

  async update({
    data,
  }: UpdateRecuperacionPersist): Promise<RecuperacionWithRelations> {
    return await prisma.recuperacion.update(data);
  }

  async delete(id: number): Promise<void> {
    await prisma.recuperacion.delete({
      where: { id },
    });
  }
}
