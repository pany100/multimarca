"use client";

import { getFormattedDate } from "@/utils/fieldHelper";
import { Box, Button, CardContent, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEmpleadosContext } from "../context/EmpleadosContext";

function MecanicosPersonalData() {
  const { empleado } = useEmpleadosContext();
  const router = useRouter();

  const handleEditClick = () => {
    if (empleado?.id) {
      router.push(`/dashboard/mecanicos/${empleado.id}/editar`);
    }
  };

  return (
    <>
      <Box sx={{ bgcolor: "primary.main", color: "white", p: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Datos personales
        </Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Nombre
            </Typography>
            <Typography>{empleado?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography>{empleado?.email || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              CUIT/CUIL
            </Typography>
            <Typography>{empleado?.dni || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Tipo de contrato
            </Typography>
            <Typography>{empleado?.tipo || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Fecha de nacimiento
            </Typography>
            <Typography>
              {empleado?.birthday
                ? getFormattedDate(empleado?.birthday.toString())
                : "No especificado"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Teléfono
            </Typography>
            <Typography>{empleado?.phone || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Contacto de emergencia
            </Typography>
            <Typography>
              {empleado?.contactoEmergencia || "No especificado"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Dirección
            </Typography>
            <Typography>{empleado?.address || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Ciudad
            </Typography>
            <Typography>{empleado?.city || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Provincia
            </Typography>
            <Typography>{empleado?.state || "No especificado"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Código Postal
            </Typography>
            <Typography>
              {empleado?.postal_code || "No especificado"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEditClick}
                disabled={!empleado?.id}
              >
                Editar Datos Personales
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </>
  );
}

export default MecanicosPersonalData;
