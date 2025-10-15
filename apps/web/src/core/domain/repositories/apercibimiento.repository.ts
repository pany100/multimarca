import {
  CreateApercibimientoData,
  UpdateApercibimientoData,
} from "@/core/infrastructure/validation/schemas/apercibimiento.schema";
import { Apercibimiento } from "@prisma/client";

export interface ApercibimientoRepository {
  create(data: CreateApercibimientoData): Promise<Apercibimiento>;
  findById(id: number): Promise<Apercibimiento | null>;
  update(data: UpdateApercibimientoData): Promise<Apercibimiento>;
  delete(id: number): Promise<Apercibimiento>;
}
