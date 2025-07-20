import * as yup from "yup";

export const schema = yup.object({
  presupuesto: yup.boolean(),
  fecha: yup.date().required("La fecha es requerida"),
  clienteId: yup.number().nullable(),
  informacionCliente: yup.string().nullable(),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      unidadesConsumidas: yup
        .number()
        .positive()
        .integer()
        .required("Las unidades consumidas son requeridas"),
    })
  ),
  trabajosRealizados: yup.array().of(
    yup.object().shape({
      manoDeObra: yup
        .object()
        .shape({
          name: yup.string().required(),
          diasParaRecordatorio: yup.number().positive().integer().nullable(),
        })
        .required("La mano de obra es requerida"),
      precioUnitario: yup
        .number()
        .positive()
        .required("El precio unitario es requerido"),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      proveedor: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El proveedor es requerido"),
      recibo: yup.string().nullable(),
    })
  ),
  descuento: yup.number().min(0).nullable(),
  descripcionDescuento: yup.string().nullable(),
  incremento: yup.number().min(0).nullable(),
  descripcionIncremento: yup.string().nullable(),
});
