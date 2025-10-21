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

export const precioFinalReparacionesSchema = z.object({
  reparacionesTerceros: z.array(terceroSchema),
  porcentajeRecargo: z.coerce.number().optional(),
});

export const precioFinalRepuestosSchema = z.object({
  repuestosUsados: z.array(repuestoSchema),
});

export type PrecioDto = z.infer<typeof precioSchema>;
export type PrecioFinalReparacionesDto = z.infer<
  typeof precioFinalReparacionesSchema
>;
export type PrecioFinalRepuestosDto = z.infer<
  typeof precioFinalRepuestosSchema
>;
