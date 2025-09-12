import {
  balanceGeneralQuerySchema,
  getAutosQuerySchema,
  mecanicosQuerySchema,
} from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { z } from "zod";

export type GetAutosDto = z.infer<typeof getAutosQuerySchema>;
export type BalanceGeneralDto = z.infer<typeof balanceGeneralQuerySchema>;
export type MecanicosDto = z.infer<typeof mecanicosQuerySchema>;
