"use client";

import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup
  .object({
    label: yup.string().required("El nombre es requerido"),
    esIngreso: yup.boolean(),
    esGasto: yup.boolean(),
  })
  .test(
    "at-least-one-true",
    "Al menos una de las opciones (Ingreso o Gasto) debe ser seleccionada",
    (values) => values.esIngreso === true || values.esGasto === true
  );

function TiposOperacionForm() {
  const {
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agregar tipo de operación
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <CustomInputText name="label" label="Nombre" type="text" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputBoolean name="esIngreso" label="Operación de ingreso?" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputBoolean name="esGasto" label="Operación de gasto?" />
        </Grid>
      </Grid>
      {errors[""] && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          {errors[""].message as string}
        </Typography>
      )}
    </>
  );
}

export default TiposOperacionForm;
