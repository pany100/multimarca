import {
  CreateDatosVariosData,
  UpdateDatosVariosData,
} from "@/core/infrastructure/validation/schemas/datos-varios.schema";
import { PageResult } from "@/shared/utils/pagination";
import { DatosVarios } from "@prisma/client";

export type ListDatosVariosParams = {
  page: number;
  size: number;
  query?: string;
};

export interface DatosVariosRepository {
  create(data: CreateDatosVariosData): Promise<DatosVarios>;
  findById(id: number): Promise<DatosVarios | null>;
  findAll(): Promise<DatosVarios[]>;
  listPaged<T = DatosVarios>(
    params: ListDatosVariosParams
  ): Promise<PageResult<T>>;
  update(data: UpdateDatosVariosData): Promise<DatosVarios>;
  delete(id: number): Promise<DatosVarios>;
}
