import { z } from "zod";

export const createInformacionSensibleSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  texto: z.string().min(1, "El texto es requerido"),
});

export const updateInformacionSensibleSchema = createInformacionSensibleSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateInformacionSensibleData = z.infer<
  typeof createInformacionSensibleSchema
>;
export type UpdateInformacionSensibleData = z.infer<
  typeof updateInformacionSensibleSchema
>;
