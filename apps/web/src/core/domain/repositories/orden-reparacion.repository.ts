import { PageResult } from "@/shared/utils/pagination";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";

export type ListOrdenesParams = {
  page: number;
  size: number;
  query?: string;
  estado?: EstadoOrdenReparacion | string;
};

export type CreateOrdenPersist = {
  data: Prisma.OrdenReparacionCreateArgs;
};

export interface OrdenReparacionRepository {
  listPaged(params: ListOrdenesParams): Promise<PageResult<any>>;
  findMatchingIdsByFormattedDate(query: string): Promise<number[]>;
  create(tx: any, payload: CreateOrdenPersist["data"]): Promise<any>;
}
