"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid } from "@mui/material";

function EditRecargoForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomInputText
          name="porcentajeRecargo"
          label="Porcentaje de recargo"
          type="number"
        />
      </Grid>
    </Grid>
  );
}

export default EditRecargoForm;
