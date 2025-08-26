import type {
  CreateTareaInput,
  ListTareasParams,
  TareaDiariaRepository,
} from "@/core/domain/repositories/tarea-diaria.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaTareaDiariaRepository implements TareaDiariaRepository {
  async list({ fecha, incluirAnteriores, user }: ListTareasParams) {
    let where: any = {};

    if (user.rol?.name === "Administrador") {
      where = {};
    } else {
      where.usuarioId = user.id;
    }

    const fechaDate = new Date(fecha);
    const fechaLimite = new Date(fechaDate);
    fechaLimite.setDate(fechaLimite.getDate() - 365);

    if (incluirAnteriores) {
      where = {
        ...where,
        OR: [
          { fecha: { gte: fechaDate } },
          { fecha: { lt: fechaDate, gte: fechaLimite } },
        ],
      };
    } else {
      where.fecha = { gte: fechaDate };
    }

    return prisma.tareaDiaria.findMany({
      where,
      orderBy: [{ id: "desc" }, { fecha: "asc" }],
      include: {
        usuario: { select: { id: true, fullName: true, username: true } },
      },
    });
  }

  create(input: CreateTareaInput) {
    return prisma.tareaDiaria.create({ data: input });
  }

  findById(id: number) {
    return prisma.tareaDiaria.findUnique({ where: { id } });
  }

  updatePartial(
    id: number,
    data: Partial<Pick<CreateTareaInput, "descripcion" | "realizado">>
  ) {
    return prisma.tareaDiaria.update({
      where: { id },
      data,
      include: {
        usuario: { select: { id: true, fullName: true, username: true } },
      },
    });
  }

  async delete(id: number) {
    await prisma.tareaDiaria.delete({ where: { id } });
  }
}
