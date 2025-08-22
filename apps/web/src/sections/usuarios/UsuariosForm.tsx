import CustomInputBoolean from "@/components/formV2/CustomInputBoolean";
import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useRoles from "@/hooks/useRoles";
import { Grid, Typography } from "@mui/material";
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
  activo: yup.boolean(),
});

const UsuariosForm = () => {
  const { roles } = useRoles();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Usuario
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CustomInputText name="fullName" label="Nombre completo" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="username" label="Nombre de usuario" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="email" label="Email" type="email" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputText name="password" label="Password" type="password" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect options={roles} label="Rol" name="rolId" />
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomInputBoolean name="activo" label="Activo?" />
        </Grid>
      </Grid>
    </>
  );
};

export default UsuariosForm;
