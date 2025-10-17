import { z } from "zod";

export const listTareasQuerySchema = z.object({
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
  search: z.string().optional(), // Búsqueda por texto en descripción
  nombre: z.string().optional(), // Búsqueda por nombre de usuario
});

// POST body
export const createTareaSchema = z.object({
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  userId: z.number(),
});

export const updateTareaSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es requerida")
    .optional(),
  realizado: z.boolean().optional(),
});
