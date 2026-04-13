"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Alert, Box, Grid, Typography } from "@mui/material";

function EditCostosForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="warning" variant="filled">
          Esta seccion existe unicamente por compatibilidad con registros
          anteriores. Para cargar descuentos, incrementos o ajustes de precio,
          utiliza la seccion <strong>&quot;Ajustes de Precios&quot;</strong>.
        </Alert>
      </Grid>

      <Grid item xs={4}>
        <CustomInputText
          name="incrementoInterno"
          label="Incremento oculto para el cliente"
          type="number"
        />
      </Grid>
      <Grid item xs={8}>
        <Box display="flex" alignItems="center" height="100%">
          <Typography variant="body2" color="text.secondary">
            Este incremento va a mostrarse como parte del primer item de la mano
            de obra cuando se imprima el presupuesto para el cliente. Si no hay
            mano de obra, se suma al primer repuesto o reparación de terceros.
            Ejemplo: redondeo.
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
