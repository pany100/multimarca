import { getUltimaSemanaSchema } from "@/core/infrastructure/validation/schemas/gasto.schema";
import { z } from "zod";

export type GastoDto = z.infer<typeof getUltimaSemanaSchema>;
