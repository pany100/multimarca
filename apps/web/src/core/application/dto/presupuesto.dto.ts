import {
  createPresupuestoSchema,
  listPresupuestoQuerySchema,
} from "@/core/infrastructure/validation/schemas/presupuesto.schema";
import { z } from "zod";

export type ListPresupuestosDto = z.infer<typeof listPresupuestoQuerySchema>;
export type CreatePresupuestoDto = z.infer<typeof createPresupuestoSchema>;
