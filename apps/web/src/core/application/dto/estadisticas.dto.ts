import {
  balanceGeneralQuerySchema,
  dateRangeSchema,
  getAutosQuerySchema,
  getByFechaQuerySchema,
  getModelosPorMarcaQuerySchema,
  mecanicosQuerySchema,
} from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { z } from "zod";

export type GetAutosDto = z.infer<typeof getAutosQuerySchema>;
export type GetModelosPorMarcaDto = z.infer<typeof getModelosPorMarcaQuerySchema>;
export type BalanceGeneralDto = z.infer<typeof balanceGeneralQuerySchema>;
export type MecanicosDto = z.infer<typeof mecanicosQuerySchema>;
export type GetByFechaDto = z.infer<typeof getByFechaQuerySchema>;
export type DateRangeDto = z.infer<typeof dateRangeSchema>;
