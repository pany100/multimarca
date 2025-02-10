import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import useRoles from "@/hooks/useRoles";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface UsuarioFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const schema = yup.object().shape({
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

const UsuarioForm = ({ onSubmit, initialValues }: UsuarioFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });
  const { roles } = useRoles();

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          size="large"
          sx={{ position: "relative" }}
        >
          Guardar Usuario
          {isSubmitting && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
              }}
            />
          )}
        </Button>
      </Box>
    </form>
  );
};

export default UsuarioForm;
