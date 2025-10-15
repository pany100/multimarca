import {
  CreateInasistenciaData,
  UpdateInasistenciaData,
} from "@/core/infrastructure/validation/schemas/inasistencia.schema";
import { Inasistencia } from "@prisma/client";

export interface InasistenciaRepository {
  create(data: CreateInasistenciaData): Promise<Inasistencia>;
  findById(id: number): Promise<Inasistencia | null>;
  update(data: UpdateInasistenciaData): Promise<Inasistencia>;
  delete(id: number): Promise<Inasistencia>;
}
