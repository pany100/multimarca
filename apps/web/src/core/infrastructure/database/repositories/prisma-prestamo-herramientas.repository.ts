import { PrestamoHerramientasRepository } from "@/core/domain/repositories/prestamo-herramientas.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import {
  CreatePrestamoHerramientasData,
  UpdatePrestamoHerramientasData,
} from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
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
