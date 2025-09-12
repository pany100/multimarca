import { generateReciboQuerySchema } from "@/core/infrastructure/validation/schemas/ingreso-reparacion.schema";
import { z } from "zod";
export type GenerateReciboDto = z.infer<typeof generateReciboQuerySchema>;
