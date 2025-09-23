import { resumenSchema } from "@/core/infrastructure/validation/schemas/resumen-transaccion.schema";
import { z } from "zod";

export type GetResumenesDto = z.infer<typeof resumenSchema>;
