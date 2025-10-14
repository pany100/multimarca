import { z } from "zod";

const baseSchema = z.object({
  empleadoId: z.number(),
  fechaDesde: z.coerce.date(),
  fechaHasta: z.coerce.date(),
  estado: z.enum(["Pendiente", "Aprobada", "Rechazada", "Cancelada"]),
  observaciones: z.string().optional(),
  esGoceSueldo: z.boolean().optional(),
  fechaCreacion: z.date().optional(),
  fechaAprobacion: z.coerce.date().optional(),
  tipo: z.enum(["Vacaciones", "Licencia"]),
});

export const createAusenciaProgramadaSchema = baseSchema.refine(
  (data) => data.fechaDesde < data.fechaHasta,
  {
    message: "La fecha desde debe ser menor que la fecha hasta",
    path: ["fechaHasta"],
  }
);

export const updateAusenciaProgramadaSchema = baseSchema
  .extend({
    id: z.number(),
  })
  .refine((data) => data.fechaDesde < data.fechaHasta, {
    message: "La fecha desde debe ser menor que la fecha hasta",
    path: ["fechaHasta"],
  });

export const getAusenciaProgramadaSchema = z.object({
  id: z.number(),
});

export type CreateAusenciaProgramadaSchema = z.infer<
  typeof createAusenciaProgramadaSchema
>;
export type UpdateAusenciaProgramadaSchema = z.infer<
  typeof updateAusenciaProgramadaSchema
>;
export type GetAusenciaProgramadaSchema = z.infer<
  typeof getAusenciaProgramadaSchema
>;
