import { z } from "zod";
import {
  createTareaAdministrativaSchema,
  updateTareaAdministrativaSchema,
  deleteTareaAdministrativaSchema,
} from "@/core/infrastructure/validation/schemas/tarea-administrativa.schema";

export type CreateTareaAdministrativaDto = z.infer<
  typeof createTareaAdministrativaSchema
>;
export type UpdateTareaAdministrativaDto = z.infer<
  typeof updateTareaAdministrativaSchema
>;
export type DeleteTareaAdministrativaDto = z.infer<
  typeof deleteTareaAdministrativaSchema
>;
