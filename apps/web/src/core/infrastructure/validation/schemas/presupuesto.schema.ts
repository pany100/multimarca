import { z } from "zod";

export const listPresupuestoQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});

const repuestoSchema = z.object({
  stock: z.object({ id: z.coerce.number(), name: z.string().optional() }),
  unidadesConsumidas: z.coerce.number().int().positive(),
  precioCompra: z.coerce.number().optional(),
  precioVenta: z.coerce.number().optional(),
});

const terceroSchema = z.object({
  nombre: z.string().min(1),
  proveedor: z.object({ id: z.coerce.number() }),
  precioCompra: z.coerce.number().optional(),
  precioVenta: z.coerce.number().optional(),
  recibo: z.string().nullable().optional(),
});

const trabajoSchema = z.object({
  manoDeObra: z.object({ name: z.string().min(1) }).optional(),
  descripcion: z.string().optional(),
  precioUnitario: z.coerce.number(),
  diasParaRecordatorio: z.coerce.number().int().nullable().optional(),
});

const tareasAdministrativasSchema = z.object({
  usuarioId: z.coerce.number(),
  descripcion: z.string().min(1),
});

export const getPresupuestoQuerySchema = z.object({
  id: z.coerce.number().positive(),
});

export const createPresupuestoSchema = z.object({
  autoId: z.coerce.number().nullable().optional(),
  observacionesCliente: z
    .string()
    .min(1, "Las observaciones del cliente son obligatorias"),
  detallesDeTrabajo: z.string().optional().nullable(),
  informacionAuto: z.string().optional().nullable(),
  informacionCliente: z.string().optional().nullable(),
  cedulaFilePath: z.string().nullable().optional(),
  repuestosUsados: z.array(repuestoSchema).optional(),
  reparacionesDeTercero: z.array(terceroSchema).optional(),
  trabajosRealizados: z.array(trabajoSchema).optional(),
  tareasAdministrativas: z.array(tareasAdministrativasSchema).optional(),
  descuento: z.coerce.number().optional(),
  porcentajeRecargo: z.coerce.number().optional(),
  descripcionDescuento: z.string().optional().nullable(),
  incrementoInterno: z.coerce.number().optional(),
  incremento: z.coerce.number().optional(),
  descripcionIncremento: z.string().optional().nullable(),
  estado: z.string().optional(),
  fecha: z.coerce.date(),
  fechaRespuesta: z.coerce.date().nullable().optional(),
  fechaEnvio: z.coerce.date().nullable().optional(),
});

export const updatePresupuestoSchema = z.object({
  ...getPresupuestoQuerySchema.shape,
  ...createPresupuestoSchema.shape,
});

export const patchPresupuestoSchema = z.object({
  id: z.string(),
  autoId: z.coerce.number().nullable().optional(),
  observacionesCliente: z.string().optional(),
  detallesDeTrabajo: z.string().nullable().optional(),
  informacionAuto: z.string().nullable().optional(),
  informacionCliente: z.string().nullable().optional(),
  cedulaFilePath: z.string().nullable().optional(),
  estado: z.string().optional(),
  fecha: z.coerce.date().optional(),
  fechaRespuesta: z.coerce.date().nullable().optional(),
  fechaEnvio: z.coerce.date().nullable().optional(),
  descuento: z.coerce.number().nullable().optional(),
  porcentajeRecargo: z.coerce.number().nullable().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incrementoInterno: z.coerce.number().nullable().optional(),
  incremento: z.coerce.number().nullable().optional(),
  descripcionIncremento: z.string().nullable().optional(),
});
