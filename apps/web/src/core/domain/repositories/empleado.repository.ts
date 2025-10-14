import { ListMecanicosQueryData } from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";
import { EmpleadoVO } from "../value-objects/empleado-vo";

export interface EmpleadoRepository {
  listPaged(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>>;
  create(dto: EmpleadoVO): Promise<Empleado>;
  findById(id: number): Promise<Empleado | null>;
  delete(id: number): Promise<Empleado | null>;
  update(dto: EmpleadoVO): Promise<Empleado>;
  getReparacionesEmpleado(id: number, from: Date, to: Date): Promise<any>;
}
