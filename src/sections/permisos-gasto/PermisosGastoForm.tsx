"use client";

import CustomSelect from "@/components/formV2/CustomSelect";
import useCategoriasGasto from "@/hooks/useCategoriasGasto";
import useRoles from "@/hooks/useRoles";
import { Grid, Typography } from "@mui/material";
import * as yup from "yup";

export const schema = yup.object({
  id: yup.string().required("La categoría es requerida"),
  roles: yup.array().min(1, "Debe seleccionar al menos un rol"),
});

const PermisosGastoForm = () => {
  const { roles } = useRoles();
  const { categorias } = useCategoriasGasto();

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Información del Permiso
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomSelect name="id" label="Categoría" options={categorias} />
        </Grid>
        <Grid item xs={12}>
          <CustomSelect name="roles" label="Roles" options={roles} multiple />
        </Grid>
      </Grid>
    </>
  );
};

export default PermisosGastoForm;
