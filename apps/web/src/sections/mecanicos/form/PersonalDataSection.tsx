"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";

function PersonalDataSection() {
  return (
    <>
      {/* Datos personales */}
      <Typography variant="h6" gutterBottom>
        Datos personales
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="name" label="Nombre" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="email" label="Email" type="email" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText
            name="birthday"
            label="Fecha de nacimiento"
            type="date"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText
            name="start_date"
            label="Fecha de comienzo"
            type="date"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default PersonalDataSection;
