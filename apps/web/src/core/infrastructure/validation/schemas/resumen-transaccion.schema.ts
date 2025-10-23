import { z } from "zod";

export const resumenSchema = z.object({
  page: z.coerce.number().min(0),
  size: z.coerce.number().min(1).max(200),
  query: z.string(),
  tipoOperacionId: z.coerce.number().optional(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  decodedToken: z.object({
    userId: z.number(),
  }),
});

export const updateRevisadoYEnviadoSchema = z.object({
  id: z.coerce.number().min(1),
  revisado: z.boolean().optional(),
  reciboEnviado: z.boolean().optional(),
});

export const updateProveedorRevisadoSchema = z.object({
  id: z.coerce.number().min(1),
  revisado: z.boolean(),
});
