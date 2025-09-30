import { z } from "zod";

export const getAutosQuerySchema = z.object({
  año: z.string().optional().nullable(),
  mes: z.string().optional().nullable(),
});

export const getByFechaQuerySchema = z.object({
  año: z.string().optional().nullable(),
  mes: z.string().optional().nullable(),
});

export const balanceGeneralQuerySchema = z.object({
  moneda: z.string().optional().nullable(),
  año: z.string().optional().nullable(),
  mes: z.string().optional().nullable(),
});

export const mecanicosQuerySchema = z.object({
  moneda: z.string().optional().nullable(),
});

export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});
