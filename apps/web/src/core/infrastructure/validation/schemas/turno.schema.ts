import { z } from "zod";

export const listTurnosQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(200).default(10),
  query: z.string().default(""),
  fecha: z.string().optional(),
  future: z
    .enum(["true", "false"])
    .optional()
    .transform((v): boolean | undefined =>
      v === undefined ? undefined : v === "true"
    ),
});

export type ListTurnosQueryDto = z.infer<typeof listTurnosQuerySchema>;

const turnoBodyBase = z.object({
  hora: z.string().min(1, "La hora es requerida"),
  fecha: z.string().min(1, "La fecha es requerida"),
  problema: z.string().min(1, "La descripción del problema es requerida").max(255),
  autoId: z.number().int().positive().nullable().optional(),
  informacionAuto: z.string().nullable().optional(),
  informacionPatente: z.string().nullable().optional(),
  clienteNombre: z.string().nullable().optional(),
  clienteTelefono: z.string().nullable().optional(),
  vino: z.boolean().nullable().optional(),
  observaciones: z.string().nullable().optional(),
});

export const createTurnoSchema = turnoBodyBase.refine(
  (data) => !!data.autoId || !!data.informacionAuto,
  { message: "Debe seleccionar un vehículo o ingresar información del vehículo nuevo", path: ["autoId"] }
);

export type CreateTurnoDto = z.infer<typeof createTurnoSchema>;

export const updateTurnoSchema = createTurnoSchema;
export type UpdateTurnoDto = z.infer<typeof updateTurnoSchema>;

export const patchTurnoVinoSchema = z.object({
  vino: z.boolean({ required_error: "Se requiere el campo 'vino' (boolean)" }),
});
export type PatchTurnoVinoDto = z.infer<typeof patchTurnoVinoSchema>;

export const turnoIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});
export type TurnoIdParamDto = z.infer<typeof turnoIdParamSchema>;
