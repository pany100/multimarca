import type {
  CreateTareaInput,
  ListTareasParams,
  TareaDiariaRepository,
} from "@/core/domain/repositories/tarea-diaria.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaTareaDiariaRepository implements TareaDiariaRepository {
  async list({
    from,
    to,
    search,
    nombre,
    user,
  }: ListTareasParams) {
    let where: any = {};

    if (user.rol?.name === "Administrador") {
      where = {};
    } else {
      where.usuarioId = user.id;
    }

    // Filtro por rango de fechas
    if (from || to) {
      const dateFilter: any = {};
      if (from) {
        dateFilter.gte = from;
      }
      if (to) {
        // Agregar 1 día y restar 1ms para incluir todo el día "to"
        const toDate = new Date(to);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setMilliseconds(toDate.getMilliseconds() - 1);
        dateFilter.lte = toDate;
      }
      where.fecha = dateFilter;
    }

    // Filtros de búsqueda
    const searchFilters: any[] = [];

    // Búsqueda por texto en descripción Y nombre de usuario
    if (search && search.trim()) {
      searchFilters.push({
        OR: [
          {
            descripcion: {
              contains: search.trim(),
            },
          },
          {
            usuario: {
              fullName: {
                contains: search.trim(),
              },
            },
          },
        ],
      });
    }

    // Búsqueda específica por nombre de usuario (si se proporciona por separado)
    if (nombre && nombre.trim()) {
      searchFilters.push({
        usuario: {
          fullName: {
            contains: nombre.trim(),
          },
        },
      });
    }

    // Combinar filtros de búsqueda con AND si hay múltiples
    if (searchFilters.length > 0) {
      where = {
        ...where,
        AND: searchFilters,
      };
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
