import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useRoles from "@/hooks/useRoles";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";

export const schema = yup.object().shape({
  fullName: yup.string().required("El nombre es requerido"),
  username: yup.string().required("El nombre de usuario es requerido"),
  email: yup
    .string()
    .email("El email es inválido")
    .required("El email es requerido"),
  password: yup.string().nullable(),
  rolId: yup
    .number()
    .typeError("Seleccione un rol válido")
    .required("El rol es requerido"),
});

const UsuariosForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { roles } = useRoles();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Usuario
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
            name="username"
            label="Nombre de usuario"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="email"
            label="Email"
            type="email"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText
            control={control}
            name="password"
            label="Password"
            type="password"
            errors={errors}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            options={roles}
            control={control}
            label="Rol"
            name="rolId"
            errors={errors}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default UsuariosForm;
