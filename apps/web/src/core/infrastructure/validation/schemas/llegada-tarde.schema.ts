import { z } from "zod";

export const createLlegadaTardeSchema = z.object({
  empleadoId: z
    .number()
    .int()
    .positive("El ID del empleado debe ser un número positivo"),
  fecha: z.coerce.date(),
  minutosRetraso: z
    .number()
    .int()
    .positive("Los minutos de retraso deben ser un número positivo"),
  motivo: z.string().nullable().optional(),
  estado: z.enum(["Justificada", "Injustificada", "Pendiente"]),
  certificadoPath: z.string().nullable().optional(),
});

export const updateLlegadaTardeSchema = createLlegadaTardeSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export const getLlegadaTardeSchema = z.object({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateLlegadaTardeData = z.infer<typeof createLlegadaTardeSchema>;
export type UpdateLlegadaTardeData = z.infer<typeof updateLlegadaTardeSchema>;
export type GetLlegadaTardeData = z.infer<typeof getLlegadaTardeSchema>;
