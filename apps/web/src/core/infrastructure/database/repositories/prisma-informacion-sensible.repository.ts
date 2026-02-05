import {
  InformacionSensibleRepository,
  ListInformacionSensibleParams,
} from "@/core/domain/repositories/informacion-sensible.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateInformacionSensibleData,
  UpdateInformacionSensibleData,
} from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { InformacionSensible } from "@prisma/client";

export class PrismaInformacionSensibleRepository
  implements InformacionSensibleRepository
{
  create(data: CreateInformacionSensibleData): Promise<InformacionSensible> {
    return prisma.informacionSensible.create({
      data,
    });
  }

  findById(id: number): Promise<InformacionSensible | null> {
    return prisma.informacionSensible.findUnique({
      where: { id },
    });
  }

  findAll(): Promise<InformacionSensible[]> {
    return prisma.informacionSensible.findMany({
      orderBy: { id: "asc" },
    });
  }

  async listPaged<T = InformacionSensible>({
    page,
    size,
    query = "",
  }: ListInformacionSensibleParams): Promise<PageResult<T>> {
    const where: any = {};

    if (query) {
      const queryNum = parseInt(query);
      where.OR = [
        ...(queryNum ? [{ id: queryNum }] : []),
        { titulo: { contains: query } },
        { texto: { contains: query } },
      ];
    }

    return prismaPaged<T>(
      prisma.informacionSensible,
      {
        where,
        orderBy: { id: "asc" },
      },
      page,
      size
    );
  }

  update(data: UpdateInformacionSensibleData): Promise<InformacionSensible> {
    const { id, ...updateData } = data;
    return prisma.informacionSensible.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: number): Promise<InformacionSensible> {
    return prisma.informacionSensible.delete({
      where: { id },
    });
  }
}
