import CustomInputText from "@/components/formV2/CustomInputText";
import { Box, Grid, Typography } from "@mui/material";

function AddressSection() {
  return (
    <>
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" gutterBottom>
          Dirección y contacto
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomInputText name="address" label="Direccion" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="state" label="Provincia" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="postal_code" label="Codigo Postal" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="phone" label="Telefono" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomInputText name="city" label="Ciudad" />
        </Grid>
      </Grid>
    </>
  );
}

export default AddressSection;
