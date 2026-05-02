import { z } from "zod";

const productoRotacionSchema = z.object({
  stockId: z.number(),
  nombre: z.string(),
  marca: z.string(),
  proveedor: z.string().nullable(),
  sector: z.string().nullable(),
  stockActual: z.number(),
  unidadesVendidas365: z.number(),
  diasPromedioStock: z.number().nullable(),
  fechaUltimoMovimiento: z.string().nullable(),
  diasDesdeUltimoMovimiento: z.number().nullable(),
});

const kpisRotacionSchema = z.object({
  totalProductosConStock: z.number(),
  productosSinMov90: z.number(),
  productosSinMov180: z.number(),
  productosSinMov365: z.number(),
  diasPromedioStockGlobal: z.number(),
});

export const generatePdfRotacionStockSchema = z.object({
  kpis: kpisRotacionSchema,
  productos: z.array(productoRotacionSchema),
});

export type GeneratePdfRotacionStockData = z.infer<typeof generatePdfRotacionStockSchema>;
