import { z } from "zod";

export const createTareaAdministrativaSchema = z.object({
  presupuestoId: z.coerce.number().positive(),
  usuarioId: z.coerce.number().positive(),
  descripcion: z.string().min(1, "La descripción es requerida"),
});

export const updateTareaAdministrativaSchema = z.object({
  id: z.coerce.number().positive(),
  usuarioId: z.coerce.number().positive().optional(),
  descripcion: z.string().min(1, "La descripción es requerida").optional(),
});

export const deleteTareaAdministrativaSchema = z.object({
  id: z.coerce.number().positive(),
});
