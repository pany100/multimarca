import { z } from "zod";

export const getUltimaSemanaSchema = z.object({
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
  decodedToken: z.object({
    userId: z.number(),
  }),
});
