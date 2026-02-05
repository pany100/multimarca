import { z } from "zod";

export const createInformacionGeneralSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  texto: z.string().min(1, "El texto es requerido"),
});

export const updateInformacionGeneralSchema = createInformacionGeneralSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateInformacionGeneralData = z.infer<
  typeof createInformacionGeneralSchema
>;
export type UpdateInformacionGeneralData = z.infer<
  typeof updateInformacionGeneralSchema
>;
