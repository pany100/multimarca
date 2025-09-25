import {
  resumenSchema,
  updateRevisadoYEnviadoSchema,
} from "@/core/infrastructure/validation/schemas/resumen-transaccion.schema";
import { z } from "zod";

export type GetResumenesDto = z.infer<typeof resumenSchema>;
export type UpdateRevisadoYEnviadoDto = z.infer<
  typeof updateRevisadoYEnviadoSchema
>;
