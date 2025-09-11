import { getAutosQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { z } from "zod";

export type GetAutosDto = z.infer<typeof getAutosQuerySchema>;
