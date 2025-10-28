import { PageResult } from "@/shared/utils/pagination";
import { Prisma } from "@prisma/client";

export type ListPerdidasParams = {
  page: number;
  size: number;
  query?: string;
  from?: string;
  to?: string;
};

export type CreatePerdidaPersist = {
  data: Prisma.PerdidasCreateArgs;
};

export type UpdatePerdidaPersist = {
  data: Prisma.PerdidasUpdateArgs;
};

export type PerdidaWithRelations = Prisma.PerdidasGetPayload<{
  include: {
    dolar: true;
    recuperaciones: true;
  };
}>;

export interface PerdidaRepository {
  listPaged<T = PerdidaWithRelations>(
    params: ListPerdidasParams
  ): Promise<PageResult<T>>;
  
  findById(id: number): Promise<PerdidaWithRelations | null>;
  
  create(params: CreatePerdidaPersist): Promise<PerdidaWithRelations>;
  
  update(params: UpdatePerdidaPersist): Promise<PerdidaWithRelations>;
  
  delete(id: number): Promise<void>;
}
