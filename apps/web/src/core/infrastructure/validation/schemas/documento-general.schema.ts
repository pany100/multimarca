import { z } from "zod";

export const createDocumentoGeneralSchema = z.object({
  titulo: z.string().min(1, "El título es requerido").max(255),
  archivoPath: z.string().url("La URL del archivo no es válida").optional(),
});

export const updateDocumentoGeneralSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
  titulo: z.string().min(1, "El título es requerido").max(255).optional(),
  archivoPath: z
    .string()
    .url("La URL del archivo no es válida")
    .nullable()
    .optional(),
});

export const listDocumentoGeneralQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  query: z.string().optional(),
});

export const getDocumentoGeneralByIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateDocumentoGeneralData = z.infer<
  typeof createDocumentoGeneralSchema
>;
export type UpdateDocumentoGeneralData = z.infer<
  typeof updateDocumentoGeneralSchema
>;
export type ListDocumentoGeneralQuery = z.output<
  typeof listDocumentoGeneralQuerySchema
>;
export type GetDocumentoGeneralByIdData = z.infer<
  typeof getDocumentoGeneralByIdSchema
>;
