"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid } from "@mui/material";

function EditNotasInternasForm() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <CustomInputText
          name="observacionesOcultas"
          label="Notas internas"
          multiline
          rows={6}
        />
      </Grid>
    </Grid>
  );
}

export default EditNotasInternasForm;
