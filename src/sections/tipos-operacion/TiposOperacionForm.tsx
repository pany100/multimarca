"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  label: yup.string().required("El nombre es requerido"),
});

function TiposOperacionForm() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agregar tipo de operación
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <CustomInputText name="label" label="Nombre" type="text" />
        </Grid>
      </Grid>
    </>
  );
}

export default TiposOperacionForm;
