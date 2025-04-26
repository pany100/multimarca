"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  fecha: yup
    .date()
    .required("La fecha es requerida")
    .min(new Date(), "No se puede crear un feriado para una fecha pasada"),
  descripcion: yup
    .string()
    .required("La descripción es requerida")
    .max(255, "La descripción no puede exceder los 255 caracteres"),
});

const FeriadosForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Feriado
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fecha" label="Fecha" type="date" />
        </Grid>
        <Grid item xs={12}>
          <CustomInputText
            name="descripcion"
            label="Descripción"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default FeriadosForm;
