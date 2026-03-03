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
  from: z
    .string()
    .optional()
    .nullable()
    .transform((v): Date | null =>
      v != null && /^\d{4}-\d{2}-\d{2}$/.test(v)
        ? new Date(v + "T00:00:00")
        : null
    ),
  to: z
    .string()
    .optional()
    .nullable()
    .transform((v): Date | null =>
      v != null && /^\d{4}-\d{2}-\d{2}$/.test(v)
        ? new Date(v + "T00:00:00")
        : null
    ),
});

export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});
