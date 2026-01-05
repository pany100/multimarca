import { TareaAdministrativaRepository } from "@/core/domain/repositories/tarea-administrativa.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { TareaAdministrativa } from "@prisma/client";

export class PrismaTareaAdministrativaRepository
  implements TareaAdministrativaRepository
{
  async create(data: {
    presupuestoId: number;
    usuarioId: number;
    descripcion: string;
  }): Promise<TareaAdministrativa> {
    return await prisma.tareaAdministrativa.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      usuarioId?: number;
      descripcion?: string;
    }
  ): Promise<TareaAdministrativa> {
    return await prisma.tareaAdministrativa.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.tareaAdministrativa.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<TareaAdministrativa | null> {
    return await prisma.tareaAdministrativa.findUnique({
      where: { id },
    });
  }
}
