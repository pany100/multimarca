"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Box, Grid, Typography } from "@mui/material";

function EditCostosForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="caption" color="text.secondary">
          Estos campos son deprecados. Para nuevos ajustes, usa la seccion
          &quot;Incrementos y Descuentos&quot;.
        </Typography>
      </Grid>

      <Grid item xs={4}>
        <CustomInputText
          name="incrementoInterno"
          label="Incremento Interno"
          type="number"
        />
      </Grid>
      <Grid item xs={8}>
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" color="text.secondary">
            Este incremento va a mostrarse como parte de la mano de obra cuando
            se imprima el informe al cliente
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={4}>
        <CustomInputText name="descuento" label="Descuento" type="number" />
      </Grid>
      <Grid item xs={8}>
        <CustomInputText
          name="descripcionDescuento"
          label="Descripcion del descuento"
        />
      </Grid>

      <Grid item xs={4}>
        <CustomInputText name="incremento" label="Incremento" type="number" />
      </Grid>
      <Grid item xs={8}>
        <CustomInputText
          name="descripcionIncremento"
          label="Descripcion del incremento"
        />
      </Grid>
    </Grid>
  );
}

export default EditCostosForm;
