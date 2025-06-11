import * as yup from "yup";

const schema = yup.object().shape({
  autoId: yup.string().required("Debe seleccionar un auto"),
  fechaCreacion: yup.string().required("La fecha de creación es requerida"),
  fechaEntradaReparacion: yup.date().nullable(),
  fechaSalidaReparacion: yup
    .date()
    .nullable()
    .min(
      yup.ref("fechaEntradaReparacion"),
      "La fecha de salida debe ser posterior a la fecha de entrada"
    ),
  kilometros: yup.number().min(0).integer(),
  observacionesCliente: yup
    .string()
    .required("Debe ingresar las observaciones"),
  observacionesOcultas: yup.string().nullable(),
  estado: yup
    .string()
    .oneOf(["Presupuestado", "EnProgreso", "Aceptado", "Terminado"])
    .required("Debe seleccionar un estado"),
  mecanicos: yup.array().of(
    yup.object().shape({
      id: yup.number().required(),
      name: yup.string().required(),
      detalle: yup.string().nullable(),
    })
  ),
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
  descuento: yup.number().min(0),
  descripcionDescuento: yup.string().nullable(),
  observacionesEntrada: yup.string(),
});

const presupuestoSchema = yup.object().shape({
  autoId: yup.string().nullable(),
  informacionAuto: yup.string().nullable(),
  informacionCliente: yup.string().nullable(),
  fecha: yup.date().required("La fecha es requerida"),
  fechaEnvio: yup.date().nullable(),
  fechaRespuesta: yup.date().nullable(),
  tareasAdministrativas: yup
    .array()
    .of(
      yup.object().shape({
        usuarioId: yup.number().required(),
        descripcion: yup.string().required(),
      })
    )
    .min(1, "Debe agregar al menos una tarea administrativa"),
  observacionesCliente: yup
    .string()
    .required("Debe ingresar las observaciones"),
  detallesDeTrabajo: yup.string().nullable(),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup.number().positive().required("El precio de venta es requerido"),
        otherwise: () => yup.mixed(),
      }),
      unidadesConsumidas: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup
            .number()
            .positive()
            .integer()
            .required("Las unidades consumidas son requeridas"),
        otherwise: () => yup.mixed(),
      }),
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
      precioUnitario: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup.number().positive().required("El precio unitario es requerido"),
        otherwise: () => yup.mixed(),
      }),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$estado", {
        is: "EnPreparacion",
        then: () =>
          yup.number().positive().required("El precio de venta es requerido"),
        otherwise: () => yup.mixed(),
      }),
      proveedor: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El proveedor es requerido"),
    })
  ),
  descuento: yup.number().min(0),
  observacionesEntrada: yup.string(),
  descripcionDescuento: yup.string().nullable(),
  incremento: yup.number().min(0),
  descripcionIncremento: yup.string().nullable(),
  estado: yup
    .string()
    .oneOf(["EnPreparacion", "Enviado", "Aceptado", "Rechazado"])
    .required(),
});

export default schema;
export { presupuestoSchema };
