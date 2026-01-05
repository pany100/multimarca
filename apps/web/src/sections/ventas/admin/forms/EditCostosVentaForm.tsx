"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid } from "@mui/material";

function EditCostosVentaForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <CustomInputText name="descuento" label="Descuento" type="number" />
      </Grid>
      <Grid item xs={8}>
        <CustomInputText
          name="descripcionDescuento"
          label="Descripción del descuento"
        />
      </Grid>

      <Grid item xs={4}>
        <CustomInputText name="incremento" label="Incremento" type="number" />
      </Grid>
      <Grid item xs={8}>
        <CustomInputText
          name="descripcionIncremento"
          label="Descripción del incremento"
        />
      </Grid>
    </Grid>
  );
}

export default EditCostosVentaForm;
