import { z } from "zod";

export const createDatosVariosSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  texto: z.string().min(1, "El texto es requerido"),
});

export const updateDatosVariosSchema = createDatosVariosSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateDatosVariosData = z.infer<typeof createDatosVariosSchema>;
export type UpdateDatosVariosData = z.infer<typeof updateDatosVariosSchema>;
