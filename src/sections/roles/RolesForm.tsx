import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import usePermisos from "@/hooks/usePermisos";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object().shape({
  name: yup.string().required("El nombre es requerido"),
  permisos: yup
    .array()
    .min(1, "Seleccione al menos un permiso")
    .required("Los permisos son requeridos"),
});

const RolesForm = () => {
  const { permisos } = usePermisos();
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información De Roles
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomInputText name="name" label="Nombre del Rol" />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect
            options={permisos}
            label="Permisos"
            name="permisos"
            multiple
          />
        </Grid>
      </Grid>
    </>
  );
};

export default RolesForm;
