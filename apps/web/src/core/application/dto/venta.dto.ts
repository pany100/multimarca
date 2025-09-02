import {
  createVentaDtoSchema,
  getVentaQuerySchema,
  listVentasQuerySchema,
  updateVentaDtoSchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
import { z } from "zod";

export type ListVentasQueryDto = z.infer<typeof listVentasQuerySchema>;
export type CreateVentaDto = z.infer<typeof createVentaDtoSchema>;
export type UpdateVentaDto = z.infer<typeof updateVentaDtoSchema>;
export type GetVentaDto = z.infer<typeof getVentaQuerySchema>;
