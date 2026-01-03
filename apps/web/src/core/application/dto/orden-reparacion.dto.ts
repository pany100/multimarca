import {
  addMecanicoToOrdenSchema,
  createOrdenSchema,
  deleteMecanicoFromOrdenSchema,
  listOrdenesQuerySchema,
  updateMecanicoInOrdenSchema,
  updateOrdenSchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { z } from "zod";

export type CreateOrdenDto = z.infer<typeof createOrdenSchema>;
export type ListOrdenesDto = z.infer<typeof listOrdenesQuerySchema>;
export type UpdateOrdenDto = z.infer<typeof updateOrdenSchema>;
export type AddMecanicoToOrdenDto = z.infer<typeof addMecanicoToOrdenSchema>;
export type UpdateMecanicoInOrdenDto = z.infer<
  typeof updateMecanicoInOrdenSchema
>;
export type DeleteMecanicoFromOrdenDto = z.infer<
  typeof deleteMecanicoFromOrdenSchema
>;
