import { NotaAdministrativaRepository } from "@/core/domain/repositories/nota-administrativa.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateNotaAdministrativaData,
  ListNotaAdministrativaQuery,
  UpdateNotaAdministrativaData,
} from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";

export class PrismaNotaAdministrativaRepository
  implements NotaAdministrativaRepository
{
  async list(query: ListNotaAdministrativaQuery) {
    const { page, size, empleadoId } = query;
    const skip = page * size;
    const where = empleadoId ? { empleadoId } : {};

    const [items, total] = await Promise.all([
      prisma.notaAdministrativa.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: "asc" },
      }),
      prisma.notaAdministrativa.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  findById(id: number) {
    return prisma.notaAdministrativa.findUnique({
      where: { id },
    });
  }

  create(data: CreateNotaAdministrativaData) {
    return prisma.notaAdministrativa.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha ?? undefined,
        titulo: data.titulo,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  update(data: UpdateNotaAdministrativaData) {
    return prisma.notaAdministrativa.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha ?? undefined,
        titulo: data.titulo ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  delete(id: number) {
    return prisma.notaAdministrativa.delete({
      where: { id },
    });
  }
}
