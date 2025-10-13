import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";
import { EmpleadoVO } from "../value-objects/empleado-vo";

export interface EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>>;
  create(dto: EmpleadoVO): Promise<Empleado>;
}
