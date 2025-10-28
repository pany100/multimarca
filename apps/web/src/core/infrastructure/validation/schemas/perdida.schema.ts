import { z } from "zod";

export const listPerdidasQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(200).default(10),
  query: z.string().nullable().optional(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});

export const createPerdidaSchema = z.object({
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero"),
  descripcion: z.string().min(1, "La descripción es requerida").trim(),
  moneda: z.string().nullable().optional(),
  cotizacionDolar: z.coerce.number().nullable().optional(),
});

export const getPerdidaQuerySchema = z.object({
  id: z.coerce.number(),
});

export const updatePerdidaSchema = z.object({
  id: z.coerce.number(),
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero"),
  descripcion: z.string().min(1, "La descripción es requerida").trim(),
  moneda: z.string().nullable().optional(),
  cotizacionDolar: z.coerce.number().nullable().optional(),
});
