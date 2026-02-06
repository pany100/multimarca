import {
  CreateNotaAdministrativaData,
  ListNotaAdministrativaQuery,
  UpdateNotaAdministrativaData,
} from "@/core/infrastructure/validation/schemas/nota-administrativa.schema";
import { NotaAdministrativa } from "@prisma/client";

export interface ListNotaAdministrativaResult {
  items: NotaAdministrativa[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface NotaAdministrativaRepository {
  list(query: ListNotaAdministrativaQuery): Promise<ListNotaAdministrativaResult>;
  findById(id: number): Promise<NotaAdministrativa | null>;
  create(data: CreateNotaAdministrativaData): Promise<NotaAdministrativa>;
  update(data: UpdateNotaAdministrativaData): Promise<NotaAdministrativa>;
  delete(id: number): Promise<NotaAdministrativa>;
}
