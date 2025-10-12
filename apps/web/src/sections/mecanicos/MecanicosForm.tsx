"use client";

import CustomInputText from "@/components/formV2/CustomInputText";
import CustomSelect from "@/components/formV2/CustomSelect";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import useEmpleadoPersistence from "./hooks/useEmpleadoPersistence";

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

function MecanicosForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit, control } = methods;
  const { createEmpleado } = useEmpleadoPersistence();
  const router = useRouter();
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(createEmpleado)}>
        <Box>
          {/* Header */}
          <AppBar position="sticky" color="primary" elevation={0}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Información del Empleado
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Formulario */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              {/* Datos personales */}
              <Typography variant="h6" gutterBottom>
                Datos personales
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="name" label="Nombre" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="email" label="Email" type="email" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="birthday"
                    label="Fecha de nacimiento"
                    type="date"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInputText
                    name="start_date"
                    label="Fecha de comienzo"
                    type="date"
                  />
                </Grid>
              </Grid>

              {/* Separador */}
              <Box sx={{ my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Datos laborales
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="dni" label="CUIT/CUIL" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomSelect
                    options={[
                      { value: "Mecanico", label: "Mecanico" },
                      { value: "Administrativo", label: "Administrativo" },
                    ]}
                    name="tipo"
                    label="Tipo"
                  />
                </Grid>
              </Grid>

              <Box sx={{ my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Dirección y contacto
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomInputText name="address" label="Direccion" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomInputText name="state" label="Provincia" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomInputText name="postal_code" label="Codigo Postal" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomInputText name="phone" label="Telefono" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomInputText name="city" label="Ciudad" />
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            p: 2,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            textAlign: "right",
          }}
        >
          <Button
            onClick={() => router.push("/dashboard/mecanicos")}
            sx={{ mr: 2 }}
          >
            Cancelar
          </Button>
          <Button variant="contained" type="submit">
            Guardar
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
}

export default MecanicosForm;
