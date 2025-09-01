import { ListPresupuestosDto } from "@/core/application/dto/presupuesto.dto";
import { PageResult } from "@/shared/utils/pagination";
import { Presupuesto, Prisma } from "@prisma/client";

export type ListPresupuestosParams = Omit<
  ListPresupuestosDto,
  "page" | "size"
> & {
  page: number;
  size: number;
};

export interface PresupuestoRepository {
  listPaged(params: ListPresupuestosParams): Promise<PageResult<any>>;
  create(data: Prisma.PresupuestoCreateArgs): Promise<Presupuesto>;
}
