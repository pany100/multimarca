import {
  InformacionGeneralRepository,
  ListInformacionGeneralParams,
} from "@/core/domain/repositories/informacion-general.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateInformacionGeneralData,
  UpdateInformacionGeneralData,
} from "@/core/infrastructure/validation/schemas/informacion-general.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { InformacionGeneral } from "@prisma/client";

export class PrismaInformacionGeneralRepository
  implements InformacionGeneralRepository
{
  create(data: CreateInformacionGeneralData): Promise<InformacionGeneral> {
    return prisma.informacionGeneral.create({
      data,
    });
  }

  findById(id: number): Promise<InformacionGeneral | null> {
    return prisma.informacionGeneral.findUnique({
      where: { id },
    });
  }

  findAll(): Promise<InformacionGeneral[]> {
    return prisma.informacionGeneral.findMany({
      orderBy: { id: "asc" },
    });
  }

  async listPaged<T = InformacionGeneral>({
    page,
    size,
    query = "",
  }: ListInformacionGeneralParams): Promise<PageResult<T>> {
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
      prisma.informacionGeneral,
      {
        where,
        orderBy: { id: "asc" },
      },
      page,
      size
    );
  }

  update(data: UpdateInformacionGeneralData): Promise<InformacionGeneral> {
    const { id, ...updateData } = data;
    return prisma.informacionGeneral.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: number): Promise<InformacionGeneral> {
    return prisma.informacionGeneral.delete({
      where: { id },
    });
  }
}
