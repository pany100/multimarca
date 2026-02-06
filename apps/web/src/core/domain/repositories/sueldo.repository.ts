import {
  CreateSueldoData,
  ListSueldoQuery,
  UpdateSueldoData,
} from "@/core/infrastructure/validation/schemas/sueldo.schema";
import { Sueldo } from "@prisma/client";

export interface ListSueldoResult {
  items: Sueldo[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface SueldoRepository {
  list(query: ListSueldoQuery): Promise<ListSueldoResult>;
  findById(id: number): Promise<Sueldo | null>;
  create(data: CreateSueldoData): Promise<Sueldo>;
  update(data: UpdateSueldoData): Promise<Sueldo>;
  delete(id: number): Promise<Sueldo>;
}
