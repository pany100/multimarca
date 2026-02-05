import {
  ListPrestamoHerramientasParams,
  PrestamoHerramientasRepository,
} from "@/core/domain/repositories/prestamo-herramientas.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreatePrestamoHerramientasData,
  UpdatePrestamoHerramientasData,
} from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { PrestamoHerramientas } from "@prisma/client";

export class PrismaPrestamoHerramientasRepository
  implements PrestamoHerramientasRepository
{
  create(
    data: CreatePrestamoHerramientasData
  ): Promise<PrestamoHerramientas> {
    const { devuelto, ...rest } = data;
    return prisma.prestamoHerramientas.create({
      data: {
        ...rest,
        devuelto: devuelto ?? false,
      },
    });
  }

  findById(id: number): Promise<PrestamoHerramientas | null> {
    return prisma.prestamoHerramientas.findUnique({
      where: { id },
    });
  }

  async listPaged<T = PrestamoHerramientas>({
    page,
    size,
    query = "",
  }: ListPrestamoHerramientasParams): Promise<PageResult<T>> {
    const where: any = {};

    if (query) {
      const queryNum = parseInt(query);
      where.OR = [
        ...(queryNum ? [{ id: queryNum }] : []),
        { nombre: { contains: query } },
        { herramienta: { contains: query } },
      ];
    }

    return prismaPaged<T>(
      prisma.prestamoHerramientas,
      {
        where,
        orderBy: { fecha: "desc" },
      },
      page,
      size
    );
  }

  update(data: UpdatePrestamoHerramientasData): Promise<PrestamoHerramientas> {
    const { id, ...updateData } = data;
    return prisma.prestamoHerramientas.update({
      where: { id },
      data: {
        ...updateData,
        devuelto: updateData.devuelto ?? false,
      },
    });
  }

  delete(id: number): Promise<PrestamoHerramientas> {
    return prisma.prestamoHerramientas.delete({
      where: { id },
    });
  }
}
