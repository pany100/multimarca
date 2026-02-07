import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  alias: yup.string().nullable(),
  address: yup.string().nullable(),
  email: yup.string().email("El email es inválido").nullable(),
  phone: yup.string().nullable(),
  mobile: yup.string().nullable(),
  numeroProveedor: yup
    .number()
    .typeError("El número de proveedor debe ser un número válido")
    .min(1)
    .nullable(),
  iva: yup.string().nullable(),
  cuit: yup.string().nullable(),
});

const ProveedoresForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Proveedor
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="name" label="Nombre" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="alias" label="Alias" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="numeroProveedor" label="Número de proveedor" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="address" label="Dirección" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="email" label="Email" type="email" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="phone" label="Teléfono" type="tel" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="mobile" label="Móvil" type="tel" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="iva" label="IVA" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="cuit" label="CUIT" />
        </Grid>
      </Grid>
    </>
  );
};

export default ProveedoresForm;
