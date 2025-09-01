import type {
  AgendaRepository,
  CreateAgendaInput,
  ListAgendaParams,
} from "@/core/domain/repositories/agenda.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { buildPageResult } from "@/shared/utils/pagination";

export class PrismaAgendaRepository implements AgendaRepository {
  async list({
    page,
    size,
    query = "",
    month,
    year,
    onlyPending,
  }: ListAgendaParams) {
    const where: any = {
      OR: [
        { titulo: { contains: query } },
        { descripcion: { contains: query } },
      ],
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.fecha = { gte: startDate, lte: endDate };
    }

    if (onlyPending) where.hecho = false;

    const skip = page * size;
    const [items, total] = await Promise.all([
      prisma.recordatorioAgenda.findMany({
        where,
        skip,
        take: size,
        orderBy: { fecha: "asc" },
      }),
      prisma.recordatorioAgenda.count({ where }),
    ]);

    return buildPageResult(items, total, page, size);
  }

  async create(input: CreateAgendaInput) {
    return prisma.recordatorioAgenda.create({ data: input });
  }

  async findById(id: number) {
    return prisma.recordatorioAgenda.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<CreateAgendaInput>) {
    return prisma.recordatorioAgenda.update({ where: { id }, data });
  }

  async delete(id: number) {
    await prisma.recordatorioAgenda.delete({ where: { id } });
  }
}
