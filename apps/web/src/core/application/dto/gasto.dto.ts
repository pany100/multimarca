import {
  getUltimaSemanaSchema,
  listGastosQuerySchema,
} from "@/core/infrastructure/validation/schemas/gasto.schema";
import { z } from "zod";

export type GastoDto = z.infer<typeof getUltimaSemanaSchema>;
export type ListGastosQueryDto = z.infer<typeof listGastosQuerySchema>;
