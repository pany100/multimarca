import { z } from "zod";

export const getAutosQuerySchema = z.object({
  año: z.string().optional().nullable(),
  mes: z.string().optional().nullable(),
});
