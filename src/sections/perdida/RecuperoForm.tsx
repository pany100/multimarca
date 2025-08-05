"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup.date().required("La fecha es requerida"),
  monto: yup
    .number()
    .required("El monto es requerido")
    .positive("El monto debe ser positivo"),
  detalle: yup.string().nullable(),
});

const RecuperoForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información de la Recuperación
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="monto"
            label="Monto"
            type="number"
            inputProps={{
              step: "0.01",
              min: "0",
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText name="detalle" label="Detalle" multiline rows={3} />
        </Grid>
      </Grid>
    </>
  );
};

export default RecuperoForm;
