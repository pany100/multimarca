import { z } from "zod";

export const getOrdenesQuerySchema = z.object({
  id: z.coerce.number(),
  soloConDeuda: z.boolean(),
});

export const listDeudoresQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string().nullable().optional(),
});

export const getClienteQuerySchema = z.object({
  id: z.coerce.number().positive(),
});
