import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  fullName: yup.string().required("El nombre completo es requerido"),
  email: yup.string().email("El email es inválido").nullable(),
  phone: yup.string().required("El teléfono es requerido"),
  birthday: yup
    .date()
    .typeError("La fecha de nacimiento debe ser una fecha válida")
    .nullable(),
  address: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  postal_code: yup.string().nullable(),
  tax_status: yup.string().nullable(),
  dni: yup
    .string()
    .matches(/^\d+$/, "El DNI debe contener solo números")
    .nullable(),
});

const ClientesForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información Del Cliente
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fullName" label="Nombre completo" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="email" label="Email" type="email" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="phone" label="Teléfono" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            name="birthday"
            label="Fecha de nacimiento"
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="dni" label="DNI" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="tax_status" label="Estado fiscal" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="address" label="Dirección" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="city" label="Ciudad" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="state" label="Provincia" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="postal_code" label="Código Postal" />
        </Grid>
      </Grid>
    </>
  );
};

export default ClientesForm;
