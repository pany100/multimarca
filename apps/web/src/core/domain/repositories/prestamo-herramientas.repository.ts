import {
  CreatePrestamoHerramientasData,
  UpdatePrestamoHerramientasData,
} from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { PageResult } from "@/shared/utils/pagination";
import { PrestamoHerramientas } from "@prisma/client";

export type ListPrestamoHerramientasParams = {
  page: number;
  size: number;
  query?: string;
};

export interface PrestamoHerramientasRepository {
  create(data: CreatePrestamoHerramientasData): Promise<PrestamoHerramientas>;
  findById(id: number): Promise<PrestamoHerramientas | null>;
  listPaged<T = PrestamoHerramientas>(
    params: ListPrestamoHerramientasParams
  ): Promise<PageResult<T>>;
  update(data: UpdatePrestamoHerramientasData): Promise<PrestamoHerramientas>;
  delete(id: number): Promise<PrestamoHerramientas>;
}
