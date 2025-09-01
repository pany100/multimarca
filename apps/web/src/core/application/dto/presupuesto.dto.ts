import { listPresupuestoQuerySchema } from "@/core/infrastructure/validation/schemas/presupuesto.schema";
import { z } from "zod";

export type ListPresupuestosDto = z.infer<typeof listPresupuestoQuerySchema>;
