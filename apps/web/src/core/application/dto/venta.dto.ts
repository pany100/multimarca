import {
  createVentaDtoSchema,
  getVentaQuerySchema,
  listVentasQuerySchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
import { z } from "zod";

export type ListVentasQueryDto = z.infer<typeof listVentasQuerySchema>;
export type CreateVentaDto = z.infer<typeof createVentaDtoSchema>;
export type GetVentaDto = z.infer<typeof getVentaQuerySchema>;
