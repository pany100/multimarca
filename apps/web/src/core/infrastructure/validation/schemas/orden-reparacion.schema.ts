import { z } from "zod";

export const repuestoSchema = z.object({
  stock: z.object({ id: z.coerce.number(), name: z.string().optional() }),
  unidadesConsumidas: z.coerce.number().int().positive(),
  precioCompra: z.number().optional(),
  precioVenta: z.number().optional(),
});

export const terceroSchema = z.object({
  nombre: z.string().min(1),
  proveedor: z.object({ id: z.coerce.number() }),
  precioCompra: z.number().optional(),
  precioVenta: z.number().optional(),
  recibo: z.string().nullable().optional(),
});

export const trabajoSchema = z.object({
  manoDeObra: z.object({ name: z.string().min(1) }).optional(),
  descripcion: z.string().optional(),
  precioUnitario: z.coerce.number(),
  diasParaRecordatorio: z.coerce.number().int().nullable().optional(),
});

export const createOrdenSchema = z.object({
  autoId: z.coerce.number(),
  fechaEntradaReparacion: z.coerce.date().nullable().optional(),
  fechaSalidaReparacion: z.coerce.date().nullable().optional(),
  fechaCreacion: z.coerce.date().optional(),
  kilometros: z.number().nullable().optional(),
  observacionesCliente: z.string(),
  observacionesEntrada: z.string().optional(),
  observacionesSalida: z.string().optional(),
  observacionesOcultas: z.string().nullable().optional(),
  estado: z.string().optional(),
  pdfPath: z.string().nullable().optional(),

  mecanicos: z.array(z.object({ id: z.coerce.number() })),
  repuestosUsados: z.array(repuestoSchema),
  reparacionesDeTercero: z.array(terceroSchema),
  trabajosRealizados: z.array(trabajoSchema),

  descuento: z.number().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incremento: z.number().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  incrementoInterno: z.number().optional(),
  porcentajeRecargo: z.number().optional(),
});

export const listOrdenesQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).max(200).default(10),
  query: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
});
