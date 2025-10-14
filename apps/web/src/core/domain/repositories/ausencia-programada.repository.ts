import {
  CreateAusenciaProgramadaSchema,
  UpdateAusenciaProgramadaSchema,
} from "@/core/infrastructure/validation/schemas/ausencia.schema";
import { AusenciaProgramada } from "@prisma/client";

export interface AusenciaProgramadaRepository {
  create(data: CreateAusenciaProgramadaSchema): Promise<AusenciaProgramada>;
  update(data: UpdateAusenciaProgramadaSchema): Promise<AusenciaProgramada>;
  delete(id: number): Promise<AusenciaProgramada | null>;
  get(id: number): Promise<AusenciaProgramada | null>;
}
