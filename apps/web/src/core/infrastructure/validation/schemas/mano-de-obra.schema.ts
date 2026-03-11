import { z } from "zod";

export const createManoDeObraSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(250),
  sellPrice: z.coerce.number(),
  pdfName: z.string().nullable().optional(),
});

export const updateManoDeObraSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
  name: z.string().min(1, "El nombre es requerido").max(250),
  sellPrice: z.coerce.number(),
  pdfName: z.string().nullable().optional(),
});

export const listManoDeObraQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().optional().default(""),
});

export const getManoDeObraByIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export const updateAllManoDeObraSchema = z.object({
  porcentaje: z
    .number()
    .min(0, "El porcentaje debe ser mayor o igual a 0")
    .max(100, "El porcentaje debe ser menor o igual a 100"),
});

export const generatePdfManoDeObraSchema = z.object({
  trabajosData: z.array(
    z.object({
      name: z.string(),
      sellPrice: z.string().nullable().optional(),
    }),
  ),
});

export type CreateManoDeObraData = z.infer<typeof createManoDeObraSchema>;
export type UpdateManoDeObraData = z.infer<typeof updateManoDeObraSchema>;
export type ListManoDeObraQuery = z.output<typeof listManoDeObraQuerySchema>;
export type GetManoDeObraByIdData = z.infer<typeof getManoDeObraByIdSchema>;
export type UpdateAllManoDeObraData = z.infer<typeof updateAllManoDeObraSchema>;
export type GeneratePdfManoDeObraData = z.infer<
  typeof generatePdfManoDeObraSchema
>;
