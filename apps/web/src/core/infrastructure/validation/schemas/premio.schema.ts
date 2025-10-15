import { z } from "zod";

export const createPremioSchema = z.object({
  empleadoId: z
    .number()
    .int()
    .positive("El ID del empleado debe ser un número positivo"),
  fecha: z.coerce.date(),
  tipo: z.enum(["Reconocimiento", "Economico", "Productividad", "Especial"]),
  descripcion: z.string().nullable().optional(),
  monto: z.number().positive("El monto debe ser positivo").nullable().optional(),
});

export const updatePremioSchema = createPremioSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export const getPremioSchema = z.object({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreatePremioData = z.infer<typeof createPremioSchema>;
export type UpdatePremioData = z.infer<typeof updatePremioSchema>;
export type GetPremioData = z.infer<typeof getPremioSchema>;
