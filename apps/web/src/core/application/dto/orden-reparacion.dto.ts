import {
  addMecanicoToOrdenSchema,
  addReparacionTerceroSchema,
  addRepuestoUsadoSchema,
  createOrdenSchema,
  deleteMecanicoFromOrdenSchema,
  deleteReparacionTerceroSchema,
  deleteRepuestoUsadoSchema,
  listOrdenesQuerySchema,
  updateMecanicoInOrdenSchema,
  updateOrdenSchema,
  updateReparacionTerceroSchema,
  updateRepuestoUsadoSchema,
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

export type AddRepuestoUsadoDto = z.infer<typeof addRepuestoUsadoSchema>;
export type UpdateRepuestoUsadoDto = z.infer<typeof updateRepuestoUsadoSchema>;
export type DeleteRepuestoUsadoDto = z.infer<typeof deleteRepuestoUsadoSchema>;
