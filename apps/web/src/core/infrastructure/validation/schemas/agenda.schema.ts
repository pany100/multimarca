import { z } from "zod";

export const createAgendaSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().nullable().optional(),
  fecha: z.union([z.string(), z.date()]).refine(
    (val) => {
      if (typeof val === "string") {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }
      return true;
    },
    { message: "Fecha inválida" }
  ),
  hecho: z.boolean().optional(),
  recurrence: z.string().optional(),
  fechaFinRecurrencia: z.coerce.date().optional(),
});
export type CreateAgendaSchema = z.infer<typeof createAgendaSchema>;

export const updateAgendaSchema = z.object({
  titulo: z.string().min(1, "El título es requerido").optional(),
  descripcion: z.string().nullable().optional(),
  fecha: z.coerce.date().optional(),
  hecho: z.boolean().optional(),
  recurrence: z.string().optional(),
  fechaFinRecurrencia: z.coerce.date().optional(),
});
export type UpdateAgendaSchema = z.infer<typeof updateAgendaSchema>;
