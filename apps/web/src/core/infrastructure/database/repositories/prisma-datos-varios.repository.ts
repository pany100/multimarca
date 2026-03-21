import {
  DatosVariosRepository,
  ListDatosVariosParams,
} from "@/core/domain/repositories/datos-varios.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreateDatosVariosData,
  UpdateDatosVariosData,
} from "@/core/infrastructure/validation/schemas/datos-varios.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { DatosVarios } from "@prisma/client";

export class PrismaDatosVariosRepository implements DatosVariosRepository {
  create(data: CreateDatosVariosData): Promise<DatosVarios> {
    return prisma.datosVarios.create({
      data,
    });
  }

  findById(id: number): Promise<DatosVarios | null> {
    return prisma.datosVarios.findUnique({
      where: { id },
    });
  }

  findAll(): Promise<DatosVarios[]> {
    return prisma.datosVarios.findMany({
      orderBy: { id: "asc" },
    });
  }

  async listPaged<T = DatosVarios>({
    page,
    size,
    query = "",
  }: ListDatosVariosParams): Promise<PageResult<T>> {
    const where: Record<string, unknown> = {};

    if (query) {
      const queryNum = parseInt(query, 10);
      where.OR = [
        ...(queryNum ? [{ id: queryNum }] : []),
        { titulo: { contains: query } },
        { texto: { contains: query } },
      ];
    }

    return prismaPaged<T>(
      prisma.datosVarios,
      {
        where,
        orderBy: { id: "asc" },
      },
      page,
      size
    );
  }

  update(data: UpdateDatosVariosData): Promise<DatosVarios> {
    const { id, ...updateData } = data;
    return prisma.datosVarios.update({
      where: { id },
      data: updateData,
    });
  }

  delete(id: number): Promise<DatosVarios> {
    return prisma.datosVarios.delete({
      where: { id },
    });
  }
}
