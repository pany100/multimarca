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

export type RepuestoFromOrderInDb = {
  stock: {
    id: number;
    name: string;
  };
  unidadesConsumidas: number;
  precioCompra: number;
  precioVenta: number;
};

export interface OrdenReparacionRepository {
  listPaged(params: ListOrdenesParams): Promise<PageResult<any>>;
  findMatchingIdsByFormattedDate(query: string): Promise<number[]>;
  create(tx: any, payload: CreateOrdenPersist["data"]): Promise<any>;
  findById(id: number): Promise<any | null>;
  delete(tx: any, id: number): Promise<void>;
}
