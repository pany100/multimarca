import { ListPresupuestosDto } from "@/core/application/dto/presupuesto.dto";
import { PageResult } from "@/shared/utils/pagination";

export type ListPresupuestosParams = Omit<
  ListPresupuestosDto,
  "page" | "size"
> & {
  page: number;
  size: number;
};

export interface PresupuestoRepository {
  listPaged(params: ListPresupuestosParams): Promise<PageResult<any>>;
}
