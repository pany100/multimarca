import { z } from "zod";

export const listPresupuestoQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});
