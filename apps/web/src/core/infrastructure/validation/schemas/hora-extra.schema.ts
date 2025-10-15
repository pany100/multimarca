import { z } from "zod";

export const createHoraExtraSchema = z.object({
  empleadoId: z
    .number()
    .int()
    .positive("El ID del empleado debe ser un número positivo"),
  fecha: z.coerce.date(),
  horasTotales: z
    .number()
    .positive("Las horas totales deben ser un número positivo"),
  motivo: z.string().nullable().optional(),
});

export const updateHoraExtraSchema = createHoraExtraSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export const getHoraExtraSchema = z.object({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateHoraExtraData = z.infer<typeof createHoraExtraSchema>;
export type UpdateHoraExtraData = z.infer<typeof updateHoraExtraSchema>;
export type GetHoraExtraData = z.infer<typeof getHoraExtraSchema>;
