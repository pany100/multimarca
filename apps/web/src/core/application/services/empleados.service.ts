import { EmpleadoRepository } from "@/core/domain/repositories/empleado.repository";
import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";

export class EmpleadoService {
  constructor(private readonly repo: EmpleadoRepository) {}

  async findAll(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    const result = await this.repo.listPaged(dto);
    const empleadosSerializables = result.items.map((empleado) => ({
      ...empleado,
      dni: empleado.dni ? empleado.dni.toString() : null,
    }));
    return {
      items: empleadosSerializables,
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    };
  }
}
