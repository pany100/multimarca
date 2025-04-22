import * as yup from "yup";

export const schema = yup.object({
  presupuesto: yup.boolean().required("El presupuesto es requerido"),
  fecha: yup.date().required("La fecha es requerida"),
  clienteId: yup.number().required("El cliente es requerido"),
});
