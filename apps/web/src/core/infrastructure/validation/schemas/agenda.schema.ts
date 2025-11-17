import { z } from "zod";

export const listAgendaSchema = z.object({
  month: z.coerce.number(),
  year: z.coerce.number(),
  onlyPending: z.boolean().optional(),
  general: z.boolean(),
  userId: z.number(),
});

export type ListAgendaSchema = z.infer<typeof listAgendaSchema>;

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
  fechaFinRecurrencia: z.coerce.date().optional().nullable(),
});
export type CreateAgendaSchema = z.infer<typeof createAgendaSchema>;

export const updateAgendaSchema = z.object({
  titulo: z.string().min(1, "El título es requerido").optional(),
  descripcion: z.string().nullable().optional(),
  fecha: z.coerce.date().optional(),
  hecho: z.boolean().optional(),
  recurrence: z.string().optional(),
  fechaFinRecurrencia: z.coerce.date().optional().nullable(),
  typeOfUpdate: z.enum(["this", "this_and_following", "all"]).optional(),
});
export type UpdateAgendaSchema = z.infer<typeof updateAgendaSchema>;

export const deleteAgendaSchema = z.object({
  id: z.number(),
  typeOfDelete: z.enum(["this", "this_and_following", "all"]),
  refDate: z.coerce.date(),
});
export type DeleteAgendaSchema = z.infer<typeof deleteAgendaSchema>;
