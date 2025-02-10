import { FormDefinitionProps } from "@/components/formV2/CustomForm";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  name: yup.string().required("El nombre es requerido"),
  dni: yup
    .string()
    .matches(/^\d+$/, "El DNI debe contener solo nmeros")
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

const MecanicosForm = ({ control, errors }: FormDefinitionProps) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información De Empleado
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="name"
            label="Nombre"
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
        <Grid item xs={12} md={4}>
          <CustomInputText
            control={control}
            name="birthday"
            label="Fecha de nacimiento"
            errors={errors}
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CustomInputText
            control={control}
            name="start_date"
            label="Fecha de comienzo"
            errors={errors}
            type="date"
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
            name="address"
            label="Direccion"
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
          <CustomSelect
            options={[
              { value: "Mecanico", label: "Mecanico" },
              { value: "Administrativo", label: "Administrativo" },
            ]}
            control={control}
            name="tipo"
            label="Tipo"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="postal_code"
            label="Codigo Postal"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="phone"
            label="Telefono"
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
      </Grid>
    </>
  );
};

export default MecanicosForm;
