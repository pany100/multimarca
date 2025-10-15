import { z } from "zod";

export const createInasistenciaSchema = z.object({
  empleadoId: z
    .number()
    .int()
    .positive("El ID del empleado debe ser un número positivo"),
  fecha: z.coerce.date(),
  motivo: z.string().nullable().optional(),
  tipo: z.enum(["Medica", "Personal", "SinAviso", "Otro"]),
  certificadoMedicoPath: z.string().nullable().optional(),
});

export const updateInasistenciaSchema = createInasistenciaSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export const getInasistenciaSchema = z.object({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateInasistenciaData = z.infer<typeof createInasistenciaSchema>;
export type UpdateInasistenciaData = z.infer<typeof updateInasistenciaSchema>;
export type GetInasistenciaData = z.infer<typeof getInasistenciaSchema>;
