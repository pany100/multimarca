import * as yup from "yup";

export const getSchemaPropsForCheque = (baseField: string) => {
  return {
    fechaEmision: yup.date().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("La fecha de emisión es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    fechaCobro: yup.date().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("La fecha de cobro es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    numeroCheque: yup.string().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("El número de cheque es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    banco: yup.string().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("El banco es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    monto: yup
      .number()
      .typeError("El monto debe ser un número")
      .when(baseField, {
        is: "CHEQUE",
        then: (schema) => schema.required("El monto es requerido"),
        otherwise: (schema) => schema.notRequired(),
      }),
    emisor: yup.string().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("El emisor es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    picturePath: yup.string().when(baseField, {
      is: "CHEQUE",
      then: (schema) => schema.required("La foto es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
  };
};
