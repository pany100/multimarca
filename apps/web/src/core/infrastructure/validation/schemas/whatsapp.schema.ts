import { z } from "zod";

export const listConversacionesSchema = z.object({
  clienteId: z.coerce.number().positive(),
});

export const sendPdfSchema = z.object({
  resourceType: z.enum(["orden", "venta", "presupuesto"]),
  resourceId: z.number().positive(),
});

export const sendMensajeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    conversacionId: z.coerce.number().positive(),
    to: z.string().min(1),
    body: z.string().min(1),
  }),
  z.object({
    type: z.literal("template"),
    conversacionId: z.coerce.number().positive(),
    to: z.string().min(1),
    templateName: z.string().min(1),
    languageCode: z.string().min(1),
    templateParams: z.array(z.any()).optional(),
  }),
]);

