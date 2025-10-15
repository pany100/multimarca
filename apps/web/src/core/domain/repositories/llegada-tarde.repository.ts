import {
  CreateLlegadaTardeData,
  UpdateLlegadaTardeData,
} from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";
import { LlegadaTarde } from "@prisma/client";

export interface LlegadaTardeRepository {
  create(data: CreateLlegadaTardeData): Promise<LlegadaTarde>;
  findById(id: number): Promise<LlegadaTarde | null>;
  update(data: UpdateLlegadaTardeData): Promise<LlegadaTarde>;
  delete(id: number): Promise<LlegadaTarde>;
}
