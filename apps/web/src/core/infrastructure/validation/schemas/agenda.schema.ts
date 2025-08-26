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
});
export type CreateAgendaSchema = z.infer<typeof createAgendaSchema>;
