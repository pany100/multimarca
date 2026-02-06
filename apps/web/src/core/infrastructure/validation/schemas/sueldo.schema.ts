import { z } from "zod";

export const createSueldoSchema = z.object({
  empleadoId: z.coerce.number().int().positive("El ID del empleado es requerido"),
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  descripcion: z.string().nullable().optional(),
});

export const updateSueldoSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
  fecha: z.coerce.date().optional(),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0").optional(),
  descripcion: z.string().nullable().optional(),
});

export const listSueldoQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  empleadoId: z.coerce.number().int().positive().optional(),
});

export const getSueldoByIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateSueldoData = z.infer<typeof createSueldoSchema>;
export type UpdateSueldoData = z.infer<typeof updateSueldoSchema>;
export type ListSueldoQuery = z.output<typeof listSueldoQuerySchema>;
export type GetSueldoByIdData = z.infer<typeof getSueldoByIdSchema>;
