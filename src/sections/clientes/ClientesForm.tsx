import CustomInputText from "@/components/formV2/CustomInputText";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
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
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información Del Cliente
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="fullName"
            label="Nombre completo"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="email"
            label="Email"
            errors={errors}
            type="email"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="phone"
            label="Teléfono"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="birthday"
            label="Fecha de nacimiento"
            errors={errors}
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="dni"
            label="DNI"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="tax_status"
            label="Estado fiscal"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="address"
            label="Dirección"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="city"
            label="Ciudad"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="state"
            label="Provincia"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="postal_code"
            label="Código Postal"
            errors={errors}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ClientesForm;
