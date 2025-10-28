import { z } from "zod";

export const listRecuperacionesQuerySchema = z.object({
  perdidaId: z.coerce.number(),
});

export const createRecuperacionSchema = z.object({
  perdidaId: z.coerce.number(),
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero"),
  detalle: z.string().nullable().optional(),
});

export const getRecuperacionQuerySchema = z.object({
  id: z.coerce.number(),
  recuperacionId: z.coerce.number(),
});

export const updateRecuperacionSchema = z.object({
  id: z.coerce.number(),
  recuperacionId: z.coerce.number(),
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero"),
  detalle: z.string().nullable().optional(),
});
