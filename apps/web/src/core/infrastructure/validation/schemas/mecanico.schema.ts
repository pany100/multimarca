import { z } from "zod";

export const listMecanicosQuerySchema = z.object({
  page: z.number().min(0),
  size: z.number().min(1).max(200),
  query: z.string().nullable().optional(),
  soloMecanicos: z.boolean().optional(),
});

export type ListMecanicosQueryData = z.infer<typeof listMecanicosQuerySchema>;

// Schema base para mecánicos
const baseMecanicoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  dni: z
    .string()
    .regex(
      /^(\d{2}-\d{8}-\d|\d{11})$/,
      "El CUIT/CUIL debe tener formato 00-00000000-0 o solo números"
    )
    .nullable()
    .optional(),
  email: z.string().email("El email es inválido").nullable().optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  start_date: z.date().nullable().optional(),
  birthday: z.date().nullable().optional(),
  tipo: z.enum(["Mecanico", "Administrativo"]).nullable().optional(),
  dniImagePath: z.string().nullable().optional(),
});

// Schema para crear mecánico
export const createMecanicoSchema = baseMecanicoSchema;

// Schema para editar mecánico (incluye ID)
export const editMecanicoSchema = baseMecanicoSchema.extend({
  id: z.number().int().positive("El ID debe ser un número positivo"),
});

// Tipos TypeScript derivados de los schemas
export type CreateMecanicoData = z.infer<typeof createMecanicoSchema>;
export type EditMecanicoData = z.infer<typeof editMecanicoSchema>;
