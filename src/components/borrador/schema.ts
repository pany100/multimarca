import * as yup from "yup";

const schema = yup.object().shape({
  autoId: yup.number().required("Debe seleccionar un auto"),
  observacionesCliente: yup
    .string()
    .required("Debe ingresar las observaciones"),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de venta es requerido"),
        otherwise: () => yup.mixed(),
      }),
      unidadesConsumidas: yup.mixed().when("$esBorrador", {
        is: false,
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
      precioUnitario: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio unitario es requerido"),
        otherwise: () => yup.mixed(),
      }),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup.mixed().when("$esBorrador", {
        is: false,
        then: () =>
          yup.number().positive().required("El precio de compra es requerido"),
        otherwise: () => yup.mixed(),
      }),
      precioVenta: yup.mixed().when("$esBorrador", {
        is: false,
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
  observacionesEntrada: yup.string(),
  descuento: yup.number().min(0),
  esBorrador: yup.boolean(),
});

export default schema;
