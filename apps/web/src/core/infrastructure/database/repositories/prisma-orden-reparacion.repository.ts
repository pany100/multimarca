import type {
  CreateOrdenPersist,
  ListOrdenesParams,
  OrdenReparacionRepository,
  UpdateOrdenPersist,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";

export class PrismaOrdenReparacionRepository
  implements OrdenReparacionRepository
{
  async listPaged<T = any>({
    page,
    size,
    query = "",
    estado,
  }: ListOrdenesParams): Promise<PageResult<T>> {
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
      const rows = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM OrdenReparacion
        WHERE DATE_FORMAT(fechaEntradaReparacion, '%e/%c/%Y') LIKE ${`%${query}%`}
      `;
      const ids = rows.map((r) => r.id);
      if (ids.length) where.OR.push({ id: { in: ids } });
    }

    return prismaPaged<T>(
      prisma.ordenReparacion,
      {
        where,
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
      },
      page,
      size
    );
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

  async update(tx: any, payload: UpdateOrdenPersist["data"]) {
    return tx.ordenReparacion.update(payload);
  }

  async findById(id: number) {
    return prisma.ordenReparacion.findUnique({
      where: { id },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: {
          include: {
            mecanico: true,
          },
        },
        repuestosUsados: {
          include: {
            stock: {
              include: {
                proveedor: true,
              },
            },
          },
        },
        reparacionesDeTercero: {
          include: {
            proveedor: true,
          },
        },
        ingresos: {
          include: {
            dolar: true,
          },
        },
        trabajosRealizados: true,
        revisadoPor: true,
        controlesEnReparacion: {
          include: {
            controlMecanico: {
              include: {
                parent: true,
              },
            },
          },
        },
        pagos: true,
      },
    });
  }

  async delete(tx: any, id: number) {
    const db = tx?.tx ?? prisma;
    await db.ordenReparacion.delete({ where: { id } });
  }
}
