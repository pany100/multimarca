import { z } from "zod";

export const generateReciboQuerySchema = z.object({
  id: z.coerce.number(),
});
