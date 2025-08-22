import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  dni: yup
    .string()
    .matches(
      /^(\d{2}-\d{8}-\d|\d{11})$/,
      "El CUIT/CUIL debe tener formato 00-00000000-0 o solo números"
    )
    .nullable(),
  email: yup.string().email("El email es inválido").nullable(),
  phone: yup.string().nullable(),
  city: yup.string().nullable(),
  address: yup.string().nullable(),
  state: yup.string().nullable(),
  postal_code: yup.string().nullable(),
  start_date: yup.date().nullable(),
  birthday: yup.date().nullable(),
  tipo: yup.string().oneOf(["Mecanico", "Administrativo"]).nullable(),
});

const MecanicosForm = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información De Empleado
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="name" label="Nombre" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="email" label="Email" type="email" />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="birthday"
            label="Fecha de nacimiento"
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            name="start_date"
            label="Fecha de comienzo"
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText name="dni" label="CUIT/CUIL" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="address" label="Direccion" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="state" label="Provincia" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            options={[
              { value: "Mecanico", label: "Mecanico" },
              { value: "Administrativo", label: "Administrativo" },
            ]}
            name="tipo"
            label="Tipo"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="postal_code" label="Codigo Postal" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="phone" label="Telefono" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="city" label="Ciudad" />
        </Grid>
      </Grid>
    </>
  );
};

export default MecanicosForm;
