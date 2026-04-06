import { z } from "zod";

export const listStockQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string().nullable().optional(),
  needsRestock: z.coerce.boolean().optional(),
  proveedorId: z.coerce.number().int().positive().nullable().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createStockSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  brand: z.string().min(1, "La marca es obligatoria"),
  buyPrice: z.coerce.number().optional(),
  restockValue: z.coerce.number().int().nullable().optional(),
  label: z.string().nullable().optional(),
  markup: z.coerce.number().nullable().optional(),
  proveedorId: z.coerce.number().int().positive().nullable().optional(),
  reportName: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  carBrand: z.string().nullable().optional(),
  fraccionable: z.coerce.boolean().optional(),
});

export const updateStockSchema = z.object({
  ...createStockSchema.shape,
  units: z.coerce.number().nullable().optional(),
});

export const getStockParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateStockPricesByProveedorSchema = z.object({
  proveedorId: z.coerce.number().int().positive(),
  porcentajeAumento: z.coerce.number(),
});

export const generateStockPdfSchema = z.object({
  stockData: z.array(z.any()),
});
