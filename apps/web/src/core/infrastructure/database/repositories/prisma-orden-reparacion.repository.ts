import type {
  CreateOrdenPersist,
  ListOrdenesParams,
  OrdenReparacionRepository,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaOrdenReparacionRepository
  implements OrdenReparacionRepository
{
  async list({ page, size, query = "", estado }: ListOrdenesParams) {
    const skip = page * size;
    const where: any = {
      OR: [
        { auto: { patent: { contains: query } } },
        { id: { equals: Number(query) || undefined } },
        { auto: { owner: { fullName: { contains: query } } } },
        { observacionesCliente: { contains: query } },
      ],
    };
    if (estado) where.estado = estado;
    if (query?.trim()) {
      const matchingIds = await this.findMatchingIdsByFormattedDate(query);
      if (matchingIds.length) where.OR.push({ id: { in: matchingIds } });
    }
    const [items, total] = await Promise.all([
      prisma.ordenReparacion.findMany({
        where,
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
          auto: { include: { owner: true } },
          mecanicos: true,
          controlesEnReparacion: { include: { controlMecanico: true } },
          repuestosUsados: true,
          reparacionesDeTercero: true,
          trabajosRealizados: true,
          ingresos: { include: { dolar: true } },
        },
      }),
      prisma.ordenReparacion.count({ where }),
    ]);
    return { items, total };
  }

  async findMatchingIdsByFormattedDate(query: string) {
    const rows = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM OrdenReparacion
      WHERE DATE_FORMAT(fechaEntradaReparacion, '%e/%c/%Y') LIKE ${`%${query}%`}
    `;
    return rows.map((r) => r.id);
  }

  async create(tx: any, payload: CreateOrdenPersist["data"]) {
    return tx.ordenReparacion.create(payload);
  }
}
