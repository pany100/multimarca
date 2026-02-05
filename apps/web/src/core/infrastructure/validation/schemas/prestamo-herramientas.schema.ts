import { z } from "zod";

export const createPrestamoHerramientasSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  fecha: z.coerce.date(),
  herramienta: z.string().min(1, "La herramienta es requerida"),
  devuelto: z.boolean().optional().default(false),
});

export const updatePrestamoHerramientasSchema = createPrestamoHerramientasSchema
  .partial()
  .extend({
    id: z.number().int().positive("El ID debe ser un número positivo"),
  });

export type CreatePrestamoHerramientasData = z.infer<
  typeof createPrestamoHerramientasSchema
>;
export type UpdatePrestamoHerramientasData = z.infer<
  typeof updatePrestamoHerramientasSchema
>;
