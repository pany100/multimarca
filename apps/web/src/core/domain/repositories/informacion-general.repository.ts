import {
  CreateInformacionGeneralData,
  UpdateInformacionGeneralData,
} from "@/core/infrastructure/validation/schemas/informacion-general.schema";
import { PageResult } from "@/shared/utils/pagination";
import { InformacionGeneral } from "@prisma/client";

export type ListInformacionGeneralParams = {
  page: number;
  size: number;
  query?: string;
};

export interface InformacionGeneralRepository {
  create(data: CreateInformacionGeneralData): Promise<InformacionGeneral>;
  findById(id: number): Promise<InformacionGeneral | null>;
  findAll(): Promise<InformacionGeneral[]>;
  listPaged<T = InformacionGeneral>(
    params: ListInformacionGeneralParams
  ): Promise<PageResult<T>>;
  update(data: UpdateInformacionGeneralData): Promise<InformacionGeneral>;
  delete(id: number): Promise<InformacionGeneral>;
}
