import { z } from "zod";
import {
  repuestoSchema,
  terceroSchema,
  trabajoSchema,
} from "./orden-reparacion.schema";

export const precioSchema = z.object({
  descuento: z.coerce.number().optional(),
  incremento: z.coerce.number().optional(),
  incrementoInterno: z.coerce.number().optional(),
  porcentajeRecargo: z.coerce.number().optional(),
  repuestosUsados: z.array(repuestoSchema).optional(),
  reparacionesDeTercero: z.array(terceroSchema).optional(),
  trabajosRealizados: z.array(trabajoSchema).optional(),
});

export type PrecioDto = z.infer<typeof precioSchema>;
