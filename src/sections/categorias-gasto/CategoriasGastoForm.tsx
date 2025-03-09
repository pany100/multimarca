"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  nombre: yup.string().required("El nombre es requerido"),
});

const CategoriasGastoForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información de la Categoría
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="nombre" label="Nombre" type="text" />
        </Grid>
      </Grid>
    </>
  );
};

export default CategoriasGastoForm;
