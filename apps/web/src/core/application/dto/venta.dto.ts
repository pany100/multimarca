import {
  addMecanicoToVentaSchema,
  createVentaDtoSchema,
  deleteMecanicoFromVentaSchema,
  getVentaQuerySchema,
  listVentasQuerySchema,
  patchVentaSchema,
  updateMecanicoInVentaSchema,
  updateVentaDtoSchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
import { z } from "zod";

export type ListVentasQueryDto = z.infer<typeof listVentasQuerySchema>;
export type CreateVentaDto = z.infer<typeof createVentaDtoSchema>;
export type UpdateVentaDto = z.infer<typeof updateVentaDtoSchema>;
export type GetVentaDto = z.infer<typeof getVentaQuerySchema>;
export type PatchVentaDto = z.infer<typeof patchVentaSchema>;

export type AddMecanicoToVentaDto = z.infer<typeof addMecanicoToVentaSchema>;
export type UpdateMecanicoInVentaDto = z.infer<
  typeof updateMecanicoInVentaSchema
>;
export type DeleteMecanicoFromVentaDto = z.infer<
  typeof deleteMecanicoFromVentaSchema
>;