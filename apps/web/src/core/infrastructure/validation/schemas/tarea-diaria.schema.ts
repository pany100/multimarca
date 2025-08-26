import { z } from "zod";

export const listTareasQuerySchema = z.object({
  fecha: z.coerce.date({ invalid_type_error: "La fecha es obligatoria" }),
  incluirAnteriores: z.boolean(),
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
