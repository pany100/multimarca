import { z } from "zod";

export const listConversacionesSchema = z.object({
  clienteId: z.coerce.number().positive(),
});

export const sendPdfSchema = z.object({
  resourceType: z.enum(["orden", "venta", "presupuesto"]),
  resourceId: z.number().positive(),
});

