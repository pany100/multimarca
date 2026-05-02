import { z } from "zod";

export const ajustePrecioItemSchema = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
  monto: z.coerce.number().positive("El monto debe ser positivo"),
  tipo: z.enum(["porcentual", "fijo"]),
  esDescuento: z.boolean(),
  esInterno: z.boolean(),
  orden: z.coerce.number().int(),
});

export const modoAjustesSchema = z.enum(["acumulativo", "sobreTotalBase"]);

export const createAjustePrecioSchema = z
  .object({
    descripcion: z.string().min(1, "La descripción es requerida"),
    monto: z.coerce.number().positive("El monto debe ser positivo"),
    tipo: z.enum(["porcentual", "fijo"]),
    esDescuento: z.boolean(),
    esInterno: z.boolean().default(false),
    orden: z.coerce.number().int().default(0),
    ordenReparacionId: z.coerce.number().optional(),
    ventaId: z.coerce.number().optional(),
    presupuestoId: z.coerce.number().optional(),
    ordenDeCompraId: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      const parentIds = [
        data.ordenReparacionId,
        data.ventaId,
        data.presupuestoId,
        data.ordenDeCompraId,
      ].filter((id) => id !== undefined);
      return parentIds.length === 1;
    },
    {
      message:
        "Debe proporcionar exactamente uno de: ordenReparacionId, ventaId, presupuestoId u ordenDeCompraId",
    },
  );

export const updateAjustePrecioSchema = z.object({
  id: z.coerce.number().int().positive(),
  descripcion: z.string().min(1).optional(),
  monto: z.coerce.number().positive().optional(),
  tipo: z.enum(["porcentual", "fijo"]).optional(),
  esDescuento: z.boolean().optional(),
  esInterno: z.boolean().optional(),
  orden: z.coerce.number().int().optional(),
});

export const deleteAjustePrecioSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type AjustePrecioItemDto = z.infer<typeof ajustePrecioItemSchema>;
export type ModoAjustesDto = z.infer<typeof modoAjustesSchema>;
export type CreateAjustePrecioDto = z.infer<typeof createAjustePrecioSchema>;
export type UpdateAjustePrecioDto = z.infer<typeof updateAjustePrecioSchema>;
