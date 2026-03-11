import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateManoDeObraData,
  ListManoDeObraQuery,
  UpdateManoDeObraData,
} from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";

export class PrismaManoDeObraRepository implements ManoDeObraRepository {
  async list(query: ListManoDeObraQuery) {
    const { page, size, query: searchQuery } = query;
    const skip = page * size;

    const whereClause =
      searchQuery && searchQuery.trim() !== ""
        ? (() => {
            const orConditions: { name?: { contains: string }; id?: { equals: number } }[] = [
              { name: { contains: searchQuery } },
            ];
            const numericQuery = parseInt(searchQuery, 10);
            if (
              !Number.isNaN(numericQuery) &&
              searchQuery.trim() === numericQuery.toString()
            ) {
              orConditions.push({ id: { equals: numericQuery } });
            }
            return { OR: orConditions };
          })()
        : {};

    const [items, total] = await Promise.all([
      prisma.manoDeObra.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: { name: "asc" },
      }),
      prisma.manoDeObra.count({ where: whereClause }),
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
    return prisma.manoDeObra.findUnique({
      where: { id },
    });
  }

  create(data: CreateManoDeObraData) {
    return prisma.manoDeObra.create({
      data: {
        name: data.name,
        sellPrice: data.sellPrice,
        pdfName: data.pdfName ?? undefined,
      },
    });
  }

  update(data: UpdateManoDeObraData) {
    return prisma.manoDeObra.update({
      where: { id: data.id },
      data: {
        name: data.name,
        sellPrice: data.sellPrice,
        pdfName: data.pdfName ?? undefined,
      },
    });
  }

  delete(id: number) {
    return prisma.manoDeObra.delete({
      where: { id },
    });
  }

  exportAll() {
    return prisma.manoDeObra.findMany({
      orderBy: { name: "asc" },
    });
  }

  async updateAllPrecios(
    type: "aumento" | "descuento",
    porcentaje: number
  ): Promise<number> {
    const factor =
      type === "aumento"
        ? 1 + porcentaje / 100
        : Math.max(0, 1 - porcentaje / 100);
    const result = await prisma.$executeRaw`
      UPDATE ManoDeObra
      SET sellPrice = 
        CASE 
          WHEN ROUND(sellPrice * ${factor}, 2) % 1000 > 0 
          THEN CEILING(ROUND(sellPrice * ${factor}, 2) / 1000) * 1000
          ELSE ROUND(sellPrice * ${factor}, 2)
        END
    `;
    return result as number;
  }
}
