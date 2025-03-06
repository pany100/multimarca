import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  monto: yup.number().required("El monto es requerido"),
  fechaPago: yup.date().required("La fecha de pago es requerida"),
});

const PagosAMecanicoForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Pago
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="monto" label="Monto" type="number" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fechaPago" label="Fecha de Pago" type="date" />
        </Grid>
      </Grid>
    </>
  );
};

export default PagosAMecanicoForm;
