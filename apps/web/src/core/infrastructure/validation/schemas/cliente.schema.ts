import { z } from "zod";

export const getOrdenesQuerySchema = z.object({
  id: z.coerce.number(),
  soloConDeuda: z.boolean(),
});

export const listDeudoresQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(200).default(10),
  query: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
});
