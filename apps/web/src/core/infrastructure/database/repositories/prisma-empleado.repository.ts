import { EmpleadoRepository } from "@/core/domain/repositories/empleado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult, prismaPaged } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";

export class PrismaEmpleadoRepository implements EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    return prismaPaged<Empleado>(
      prisma.empleado,
      {
        where: {
          name: { contains: dto.query },
          tipo: dto.soloMecanicos ? "Mecanico" : undefined,
        },
        orderBy: { id: "desc" },
      },
      dto.page,
      dto.size
    );
  }
}
