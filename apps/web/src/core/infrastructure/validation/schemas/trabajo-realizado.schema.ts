import { z } from "zod";

export const addTrabajoRealizadoSchema = z
  .object({
    ordenReparacionId: z.coerce.number().optional(),
    ventaId: z.coerce.number().optional(),
    presupuestoId: z.coerce.number().optional(),
    precioUnitario: z.coerce.number(),
    descripcion: z.string().min(1),
    diasParaRecordatorio: z
      .array(z.coerce.number().int())
      .nullable()
      .optional(),
    pdfName: z.string().nullable().optional(),
    iva: z.coerce.number().nullable().optional(),
  })
  .refine(
    (data) => {
      const parentIds = [
        data.ordenReparacionId,
        data.ventaId,
        data.presupuestoId,
      ].filter((id) => id !== undefined);
      return parentIds.length === 1;
    },
    {
      message:
        "Debe proporcionar exactamente uno de: ordenReparacionId, ventaId, o presupuestoId",
    }
  );

export const updateTrabajoRealizadoSchema = z.object({
  id: z.coerce.number().int().positive(),
  precioUnitario: z.coerce.number().optional(),
  descripcion: z.string().min(1).optional(),
  diasParaRecordatorio: z
    .array(z.coerce.number().int())
    .nullable()
    .optional(),
  pdfName: z.string().nullable().optional(),
  iva: z.coerce.number().nullable().optional(),
});

export const deleteTrabajoRealizadoSchema = z.object({
  id: z.coerce.number().int().positive(),
});
