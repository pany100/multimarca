import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";

export interface EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>>;
}
