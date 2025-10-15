import {
  CreatePremioData,
  UpdatePremioData,
} from "@/core/infrastructure/validation/schemas/premio.schema";
import { Premio } from "@prisma/client";

export interface PremioRepository {
  create(data: CreatePremioData): Promise<Premio>;
  findById(id: number): Promise<Premio | null>;
  update(data: UpdatePremioData): Promise<Premio>;
  delete(id: number): Promise<Premio>;
}
