import { z } from "zod";

export const getUltimaSemanaSchema = z.object({
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
  decodedToken: z.object({
    userId: z.number(),
  }),
});

export const listGastosQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});
