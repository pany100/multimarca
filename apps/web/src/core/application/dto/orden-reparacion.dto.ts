import {
  addMecanicoToOrdenSchema,
  addReparacionTerceroSchema,
  createOrdenSchema,
  deleteMecanicoFromOrdenSchema,
  deleteReparacionTerceroSchema,
  listOrdenesQuerySchema,
  updateMecanicoInOrdenSchema,
  updateOrdenSchema,
  updateReparacionTerceroSchema,
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

export type AddReparacionTerceroDto = z.infer<
  typeof addReparacionTerceroSchema
>;
export type UpdateReparacionTerceroDto = z.infer<
  typeof updateReparacionTerceroSchema
>;
export type DeleteReparacionTerceroDto = z.infer<
  typeof deleteReparacionTerceroSchema
>;
