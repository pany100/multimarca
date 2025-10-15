import { z } from "zod";

export const createApercibimientoSchema = z.object({
  empleadoId: z
    .number()
    .int()
    .positive("El ID del empleado debe ser un número positivo"),
  fecha: z.coerce.date(),
  tipo: z.enum(["Verbal", "Leve", "Grave", "MuyGrave"]),
  motivo: z.string().min(1, "El motivo es requerido"),
});

export const updateApercibimientoSchema = createApercibimientoSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export const getApercibimientoSchema = z.object({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateApercibimientoData = z.infer<typeof createApercibimientoSchema>;
export type UpdateApercibimientoData = z.infer<typeof updateApercibimientoSchema>;
export type GetApercibimientoData = z.infer<typeof getApercibimientoSchema>;
