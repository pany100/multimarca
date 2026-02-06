import { z } from "zod";

export const createCertificadoEstudioSchema = z.object({
  empleadoId: z.coerce.number().int().positive("El ID del empleado es requerido"),
  nombre: z.string().max(255).nullable().optional(),
  ruta: z.string().max(1000).nullable().optional(),
  fecha: z.coerce.date().optional(),
  descripcion: z.string().nullable().optional(),
});

export const updateCertificadoEstudioSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
  nombre: z.string().max(255).nullable().optional(),
  ruta: z.string().max(1000).nullable().optional(),
  fecha: z.coerce.date().optional(),
  descripcion: z.string().nullable().optional(),
});

export const listCertificadoEstudioQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  empleadoId: z.coerce.number().int().positive().optional(),
});

export const getCertificadoEstudioByIdSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
});

export type CreateCertificadoEstudioData = z.infer<
  typeof createCertificadoEstudioSchema
>;
export type UpdateCertificadoEstudioData = z.infer<
  typeof updateCertificadoEstudioSchema
>;
export type ListCertificadoEstudioQuery = z.output<
  typeof listCertificadoEstudioQuerySchema
>;
export type GetCertificadoEstudioByIdData = z.infer<
  typeof getCertificadoEstudioByIdSchema
>;
