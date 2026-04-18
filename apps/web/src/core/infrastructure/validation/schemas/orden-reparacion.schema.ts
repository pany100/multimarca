import { z } from "zod";
import { ajustePrecioItemSchema, modoAjustesSchema } from "./ajuste-precio.schema";

export const repuestoSchema = z.object({
  stock: z.object({ id: z.coerce.number(), name: z.string().optional() }),
  unidadesConsumidas: z.coerce.number().positive(),
  precioCompra: z.coerce.number().optional(),
  precioVenta: z.coerce.number().optional(),
  ocultoParaCliente: z.boolean().optional(),
});

export const terceroSchema = z.object({
  nombre: z.string().min(1),
  proveedor: z.object({ id: z.coerce.number() }),
  precioCompra: z.coerce.number().optional(),
  precioVenta: z.coerce.number().optional(),
  iva: z.coerce.number().nullable().optional(),
  buyIva: z.coerce.number().nullable().optional(),
  markup: z.coerce.number().nullable().optional(),
  recibo: z.string().nullable().optional(),
});

export const trabajoSchema = z.object({
  manoDeObra: z.object({ name: z.string().min(1) }).optional(),
  descripcion: z.string().optional(),
  precioUnitario: z.coerce.number(),
  diasParaRecordatorio: z.coerce.number().int().nullable().optional(),
  iva: z.coerce.number().nullable().optional(),
});

export const createOrdenSchema = z.object({
  autoId: z.coerce.number(),
  fechaEntradaReparacion: z.coerce.date().nullable().optional(),
  fechaSalidaReparacion: z.coerce.date().nullable().optional(),
  fechaCreacion: z.coerce.date().optional(),
  kilometros: z.coerce.number().nullable().optional(),
  observacionesCliente: z.string(),
  observacionesEntrada: z.string().optional(),
  observacionesSalida: z.string().optional(),
  observacionesOcultas: z.string().nullable().optional(),
  estado: z.string().optional(),
  pdfPath: z.string().nullable().optional(),

  mecanicos: z
    .array(
      z.object({
        id: z.coerce.number(),
        detalle: z.string().nullable().optional(),
      }),
    )
    .optional(),
  repuestosUsados: z.array(repuestoSchema).optional(),
  reparacionesDeTercero: z.array(terceroSchema).optional(),
  trabajosRealizados: z.array(trabajoSchema).optional(),

  descuento: z.coerce.number().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incremento: z.coerce.number().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  incrementoInterno: z.coerce.number().optional(),
  porcentajeRecargo: z.coerce.number().optional(),
  ajustesPrecio: z.array(ajustePrecioItemSchema).optional(),
  modoAjustes: modoAjustesSchema.optional(),
});

export const listOrdenesQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(200).default(10),
  query: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});

export const getOrdenQuerySchema = z.object({
  id: z.coerce.number(),
});

const controlesSchema = z.object({
  id: z.coerce.number(),
  valor: z.string(),
});

export const updateOrdenSchema = z.object({
  id: z.coerce.number(),
  autoId: z.coerce.number(),
  fechaEntradaReparacion: z.coerce.date().nullable().optional(),
  fechaSalidaReparacion: z.coerce.date().nullable().optional(),
  fechaCreacion: z.coerce.date().optional(),
  kilometros: z.coerce.number().nullable().optional(),
  observacionesCliente: z.string(),
  observacionesEntrada: z.string().optional(),
  observacionesSalida: z.string().optional(),
  observacionesOcultas: z.string().nullable().optional(),
  revisadoPorId: z.coerce.number().nullable().optional(),
  estado: z.string().optional(),
  pdfPath: z.string().nullable().optional(),
  scannerFile: z.string().nullable().optional(),
  mecanicos: z
    .array(
      z.object({
        id: z.coerce.number(),
        detalle: z.string().nullable().optional(),
      }),
    )
    .optional(),
  repuestosUsados: z.array(repuestoSchema).optional(),
  reparacionesDeTercero: z.array(terceroSchema).optional(),
  trabajosRealizados: z.array(trabajoSchema).optional(),
  controlesEnReparacion: z.array(controlesSchema).optional(),
  recibos: z.array(z.string()).optional(),
  detalleControles: z.string().nullable().optional(),
  descuento: z.coerce.number().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incremento: z.coerce.number().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  incrementoInterno: z.coerce.number().optional(),
  porcentajeRecargo: z.coerce.number().optional(),
  ajustesPrecio: z.array(ajustePrecioItemSchema).optional(),
  modoAjustes: modoAjustesSchema.optional(),
});

export const createDraftOrdenSchema = z.object({
  autoId: z.coerce.number(),
  kilometros: z.coerce.number().nullable().optional(),
  observacionesCliente: z.string(),
});

export const patchOrdenV2Schema = z.object({
  id: z.string(),
  autoId: z.coerce.number().optional(),
  kilometros: z.coerce.number().nullable().optional(),
  observacionesCliente: z.string().optional(),
  observacionesEntrada: z.string().optional(),
  estado: z.string().optional(),
  observacionesInternas: z.string().optional(),
  observacionesSalida: z.string().optional(),
  observacionesOcultas: z.string().nullable().optional(),
  fechaEntradaReparacion: z.coerce.date().nullable().optional(),
  fechaSalidaReparacion: z.coerce.date().nullable().optional(),
  controlesEnReparacion: z.array(controlesSchema).optional(),
  revisadoPorId: z.coerce.number().nullable().optional(),
  detalleControles: z.string().optional(),
  porcentajeRecargo: z.coerce.number().nullable().optional(),
  scannerFile: z.string().nullable().optional(),
  incrementoInterno: z.coerce.number().nullable().optional(),
  descuento: z.coerce.number().nullable().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incremento: z.coerce.number().nullable().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  ajustesPrecio: z.array(ajustePrecioItemSchema).optional(),
  modoAjustes: modoAjustesSchema.optional(),
  descuentoParaManoDeObra: z.coerce.number().nullable().optional(),
});

export const addMecanicoToOrdenSchema = z.object({
  ordenReparacionId: z.coerce.number(),
  mecanicoId: z.coerce.number(),
  detalle: z.string().nullable().optional(),
});

export const updateMecanicoInOrdenSchema = z.object({
  id: z.coerce.number(),
  detalle: z.string().nullable().optional(),
});

export const deleteMecanicoFromOrdenSchema = z.object({
  id: z.coerce.number(),
});

export const addReparacionTerceroSchema = z
  .object({
    ordenReparacionId: z.coerce.number().optional(),
    ventaId: z.coerce.number().optional(),
    presupuestoId: z.coerce.number().optional(),
    nombre: z.string().min(1),
    proveedorId: z.coerce.number(),
    precioCompra: z.coerce.number(),
    precioVenta: z.coerce.number(),
    iva: z.coerce.number().nullable().optional(),
    buyIva: z.coerce.number().nullable().optional(),
    markup: z.coerce.number().nullable().optional(),
    recibo: z.string().nullable().optional(),
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
    },
  );

export const updateReparacionTerceroSchema = z.object({
  id: z.coerce.number(),
  nombre: z.string().min(1).optional(),
  proveedorId: z.coerce.number().optional(),
  precioCompra: z.coerce.number().optional(),
  precioVenta: z.coerce.number().optional(),
  iva: z.coerce.number().nullable().optional(),
  buyIva: z.coerce.number().nullable().optional(),
  markup: z.coerce.number().nullable().optional(),
  recibo: z.string().nullable().optional(),
});

export const deleteReparacionTerceroSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const addRepuestoUsadoSchema = z
  .object({
    ordenReparacionId: z.number().int().positive().optional(),
    ventaId: z.number().int().positive().optional(),
    presupuestoId: z.number().int().positive().optional(),
    stockId: z.number().int().positive(),
    precioCompra: z.number().nonnegative(),
    precioVenta: z.number().nonnegative(),
    unidadesConsumidas: z.number().positive(),
    ocultoParaCliente: z.boolean().optional(),
    iva: z.coerce.number().nullable().optional(),
    buyIva: z.coerce.number().nullable().optional(),
    markup: z.coerce.number().nullable().optional(),
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
    },
  );

export const updateRepuestoUsadoSchema = z.object({
  id: z.coerce.number().int().positive(),
  stockId: z.number().int().positive().optional(),
  precioCompra: z.number().nonnegative().optional(),
  precioVenta: z.number().nonnegative().optional(),
  unidadesConsumidas: z.number().positive().optional(),
  ocultoParaCliente: z.boolean().optional(),
  iva: z.coerce.number().nullable().optional(),
  buyIva: z.coerce.number().nullable().optional(),
  markup: z.coerce.number().nullable().optional(),
});

export const deleteRepuestoUsadoSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const addReciboSchema = z.object({
  ordenId: z.coerce.number().int().positive(),
  reciboPath: z.string().min(1, "La ruta del recibo es requerida"),
});

export const deleteReciboSchema = z.object({
  ordenId: z.coerce.number().int().positive(),
  reciboPath: z.string().min(1, "La ruta del recibo es requerida"),
});
