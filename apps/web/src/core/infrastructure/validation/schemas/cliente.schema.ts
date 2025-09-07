import { z } from "zod";

export const getOrdenesQuerySchema = z.object({
  id: z.coerce.number(),
  soloConDeuda: z.boolean(),
});
