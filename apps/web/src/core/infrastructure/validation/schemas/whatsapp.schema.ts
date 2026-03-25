import { z } from "zod";

export const listConversacionesSchema = z.object({
  clienteId: z.coerce.number().positive(),
});

