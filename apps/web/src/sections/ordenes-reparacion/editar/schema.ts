import * as yup from "yup";

const schema = yup.object().shape({
  autoId: yup.number().required("Debe seleccionar un auto"),
  fechaCreacion: yup.date().required("La fecha de creación es requerida"),
  fechaEntradaReparacion: yup.date().nullable(),
  fechaSalidaReparacion: yup
    .date()
    .nullable()
    .when("estado", {
      is: "Terminado",
      then: (schema) =>
        schema.required(
          "La fecha de salida es requerida cuando el estado es Terminado"
        ),
      otherwise: (schema) => schema.nullable(),
    })
    .min(
      yup.ref("fechaEntradaReparacion"),
      "La fecha de salida debe ser posterior a la fecha de entrada"
    ),
  revisadoPorId: yup.number().nullable(),
  kilometros: yup.number().min(0).integer(),
  observacionesCliente: yup.string(),
  observacionesSalida: yup
    .string()
    .required("Debe ingresar las observaciones de salida"),
  estado: yup
    .string()
    .oneOf([
      "Presupuestado",
      "EnProgreso",
      "Aceptado",
      "ADefinir",
      "Terminado",
      "SeRetira",
    ])
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
  controlesEnReparacion: yup.array().of(
    yup.object().shape({
      id: yup.number().required("Id es requerido"),
      valor: yup.string(),
    })
  ),
  trabajosRealizados: yup.array().of(
    yup.object().shape({
      manoDeObra: yup
        .object()
        .shape({
          name: yup.string().required(),
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
  observacionesOcultas: yup.string().nullable(),
  descuento: yup.number().nullable().min(0),
  descripcionDescuento: yup.string().nullable(),
  incremento: yup.number().nullable().min(0),
  descripcionIncremento: yup.string().nullable(),
  porcentajeRecargo: yup.number().nullable().min(0),
  incrementoInterno: yup.number().nullable().min(0),
  observacionesEntrada: yup.string(),
  recibos: yup.array().of(yup.string()).nullable(),
});

export default schema;
