import {
  CreateInformacionSensibleData,
  UpdateInformacionSensibleData,
} from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";
import { PageResult } from "@/shared/utils/pagination";
import { InformacionSensible } from "@prisma/client";

export type ListInformacionSensibleParams = {
  page: number;
  size: number;
  query?: string;
};

export interface InformacionSensibleRepository {
  create(data: CreateInformacionSensibleData): Promise<InformacionSensible>;
  findById(id: number): Promise<InformacionSensible | null>;
  findAll(): Promise<InformacionSensible[]>;
  listPaged<T = InformacionSensible>(
    params: ListInformacionSensibleParams
  ): Promise<PageResult<T>>;
  update(data: UpdateInformacionSensibleData): Promise<InformacionSensible>;
  delete(id: number): Promise<InformacionSensible>;
}
