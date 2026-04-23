import {
  createStockSchema,
  exportStockQuerySchema,
  generateStockPdfSchema,
  listStockQuerySchema,
  updateStockPricesByProveedorSchema,
  updateStockSchema,
} from "@/core/infrastructure/validation/schemas/stock.schema";
import { z } from "zod";

export type ListStockDto = z.infer<typeof listStockQuerySchema>;
export type ExportStockDto = z.infer<typeof exportStockQuerySchema>;
export type CreateStockDto = z.infer<typeof createStockSchema>;
export type UpdateStockDto = z.infer<typeof updateStockSchema>;
export type UpdateStockPricesByProveedorDto = z.infer<
  typeof updateStockPricesByProveedorSchema
>;
export type GenerateStockPdfDto = z.infer<typeof generateStockPdfSchema>;
