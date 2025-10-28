import type {
  CreatePerdidaPersist,
  ListPerdidasParams,
  PerdidaRepository,
  PerdidaWithRelations,
  UpdatePerdidaPersist,
} from "@/core/domain/repositories/perdida.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";

export class PrismaPerdidaRepository implements PerdidaRepository {
  async listPaged<T = PerdidaWithRelations>({
    page,
    size,
    query = "",
    from,
    to,
  }: ListPerdidasParams): Promise<PageResult<T>> {
    const where: any = {
      OR: [
        { id: { equals: Number(query) || undefined } },
        { descripcion: { contains: query } },
      ],
    };

    // Add date filter if provided
    if (from || to) {
      where.fecha = {};

      if (from) {
        where.fecha.gte = new Date(from);
      }

      if (to) {
        // Set the end of the day for the 'to' date
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        where.fecha.lte = endDate;
      }
    }

    return prismaPaged<T>(
      prisma.perdidas,
      {
        where,
        orderBy: { fecha: "desc" },
        include: {
          dolar: true,
          recuperaciones: true,
        },
      },
      page,
      size
    );
  }

  async findById(id: number): Promise<PerdidaWithRelations | null> {
    return await prisma.perdidas.findUnique({
      where: { id },
      include: {
        dolar: true,
        recuperaciones: true,
      },
    });
  }

  async create({
    data,
  }: CreatePerdidaPersist): Promise<PerdidaWithRelations> {
    return await prisma.perdidas.create({
      ...data,
      include: {
        dolar: true,
        recuperaciones: true,
      },
    });
  }

  async update({
    data,
  }: UpdatePerdidaPersist): Promise<PerdidaWithRelations> {
    return await prisma.perdidas.update({
      ...data,
      include: {
        dolar: true,
        recuperaciones: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.perdidas.delete({
      where: { id },
    });
  }
}
