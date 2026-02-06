import { z } from "zod";

export const createNotaAdministrativaSchema = z.object({
  empleadoId: z.coerce.number().int().positive("El ID del empleado es requerido"),
  fecha: z.coerce.date().optional(),
  titulo: z.string().min(1, "El título es requerido").max(255),
  descripcion: z.string().nullable().optional(),
});

export const updateNotaAdministrativaSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
  fecha: z.coerce.date().optional(),
  titulo: z.string().min(1, "El título es requerido").max(255).optional(),
  descripcion: z.string().nullable().optional(),
});

export const listNotaAdministrativaQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  empleadoId: z.coerce.number().int().positive().optional(),
});

export const getNotaAdministrativaByIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateNotaAdministrativaData = z.infer<
  typeof createNotaAdministrativaSchema
>;
export type UpdateNotaAdministrativaData = z.infer<
  typeof updateNotaAdministrativaSchema
>;
export type ListNotaAdministrativaQuery = z.output<
  typeof listNotaAdministrativaQuerySchema
>;
export type GetNotaAdministrativaByIdData = z.infer<
  typeof getNotaAdministrativaByIdSchema
>;
