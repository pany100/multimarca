import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateSueldoData,
  ListSueldoQuery,
  UpdateSueldoData,
} from "@/core/infrastructure/validation/schemas/sueldo.schema";

export class PrismaSueldoRepository implements SueldoRepository {
  async list(query: ListSueldoQuery) {
    const { page, size, empleadoId } = query;
    const skip = page * size;
    const where = empleadoId ? { empleadoId } : {};

    const [items, total] = await Promise.all([
      prisma.sueldo.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: "asc" },
      }),
      prisma.sueldo.count({ where }),
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
    return prisma.sueldo.findUnique({
      where: { id },
    });
  }

  create(data: CreateSueldoData) {
    return prisma.sueldo.create({
      data: {
        empleadoId: data.empleadoId,
        fecha: data.fecha ?? undefined,
        monto: data.monto,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  update(data: UpdateSueldoData) {
    return prisma.sueldo.update({
      where: { id: data.id },
      data: {
        fecha: data.fecha ?? undefined,
        monto: data.monto ?? undefined,
        descripcion: data.descripcion ?? undefined,
      },
    });
  }

  delete(id: number) {
    return prisma.sueldo.delete({
      where: { id },
    });
  }
}
