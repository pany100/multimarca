import { EstadoVenta } from "@prisma/client";
import { z } from "zod";
import { ajustePrecioItemSchema, modoAjustesSchema } from "./ajuste-precio.schema";

export const ventaEstadoEnum = z.enum([
  EstadoVenta.Borrador,
  EstadoVenta.Presupuestado,
  EstadoVenta.Preparado,
  EstadoVenta.Entregado,
  EstadoVenta.Cerrado,
]);

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

export const createVentaDtoSchema = z.object({
  clienteId: z.number().int().positive().nullable().optional(),
  informacionCliente: z.string().nullable().optional(),
  cedulaFilePath: z.string().nullable().optional(),
  fecha: z.coerce.date(),

  descripcionDescuento: z.string().nullable().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  descuento: z.coerce.number().optional(),
  incremento: z.coerce.number().optional(),

  porcentajeRecargo: z.coerce.number().optional(),

  estado: ventaEstadoEnum,

  repuestosUsados: z.array(repuestoSchema).optional(),
  reparacionesDeTercero: z.array(terceroSchema).optional(),
  trabajosRealizados: z.array(trabajoSchema).optional(),
});

export const listVentasQuerySchema = z.object({
  page: z.coerce.number().min(0).optional(),
  size: z.coerce.number().min(1).max(200).optional(),
  query: z.string(),
  estado: z.string().nullable().optional(),
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});

export const getVentaQuerySchema = z.object({
  id: z.coerce.number().positive(),
});

export const updateVentaDtoSchema = z.object({
  ...getVentaQuerySchema.shape,
  ...createVentaDtoSchema.shape,
});

export const patchVentaSchema = z.object({
  id: z.coerce.number().positive(),
  clienteId: z.coerce.number().nullable().optional(),
  informacionCliente: z.string().nullable().optional(),
  cedulaFilePath: z.string().nullable().optional(),
  fecha: z.coerce.date().optional(),
  descuento: z.coerce.number().optional(),
  descripcionDescuento: z.string().nullable().optional(),
  incremento: z.coerce.number().optional(),
  descripcionIncremento: z.string().nullable().optional(),
  porcentajeRecargo: z.coerce.number().optional(),
  estado: ventaEstadoEnum.optional(),
  ajustesPrecio: z.array(ajustePrecioItemSchema).optional(),
  modoAjustes: modoAjustesSchema.optional(),
  descuentoParaManoDeObra: z.coerce.number().nullable().optional(),
});
