import {
  CreatePrestamoHerramientasData,
  UpdatePrestamoHerramientasData,
} from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { PrestamoHerramientas } from "@prisma/client";

export interface PrestamoHerramientasRepository {
  create(data: CreatePrestamoHerramientasData): Promise<PrestamoHerramientas>;
  findById(id: number): Promise<PrestamoHerramientas | null>;
  update(data: UpdatePrestamoHerramientasData): Promise<PrestamoHerramientas>;
  delete(id: number): Promise<PrestamoHerramientas>;
}
