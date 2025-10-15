import {
  CreateHoraExtraData,
  UpdateHoraExtraData,
} from "@/core/infrastructure/validation/schemas/hora-extra.schema";
import { HoraExtra } from "@prisma/client";

export interface HoraExtraRepository {
  create(data: CreateHoraExtraData): Promise<HoraExtra>;
  findById(id: number): Promise<HoraExtra | null>;
  update(data: UpdateHoraExtraData): Promise<HoraExtra>;
  delete(id: number): Promise<HoraExtra>;
}
