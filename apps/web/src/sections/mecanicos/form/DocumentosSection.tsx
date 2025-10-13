import CustomImageInput from "@/components/formV2/CustomImageInput";
import { Grid, Typography } from "@mui/material";

function DocumentosSection() {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Documentos
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <CustomImageInput name="dniImagePath" label="Foto DNI" />
        </Grid>
      </Grid>
    </>
  );
}

export default DocumentosSection;
