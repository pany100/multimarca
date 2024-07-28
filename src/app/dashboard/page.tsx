"use client";

import { useAuth } from "@/hooks/useAuth";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import Link from "next/link";

const DashboardPage = () => {
  const { userData } = useAuth();
  const userName = userData?.fullName || "Usuario";
  const permisos = userData?.permisos || [];

  const accesosPorPermiso = [
    {
      permiso: "Usuarios",
      texto: "Gestionar Usuarios",
      ruta: "/dashboard/usuarios",
    },
    { permiso: "Clientes", texto: "Ver Clientes", ruta: "/dashboard/clientes" },
    { permiso: "Autos", texto: "Gestionar Autos", ruta: "/dashboard/autos" },
    {
      permiso: "Reparaciones",
      texto: "Órdenes de Reparación",
      ruta: "/dashboard/ordenes-reparacion",
    },
    { permiso: "Stock", texto: "Revisar Stock", ruta: "/dashboard/stock" },
    { permiso: "Ventas", texto: "Registrar Venta", ruta: "/dashboard/ventas" },
  ];

  const accesosDisponibles = accesosPorPermiso.filter((acceso) =>
    permisos.includes(acceso.permiso)
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido, {userName}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Accesos Rápidos
            </Typography>
            <Grid container spacing={2}>
              {accesosDisponibles.map((acceso, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    component={Link}
                    href={acceso.ruta}
                    variant="contained"
                    fullWidth
                  >
                    {acceso.texto}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Typography variant="body1">
              Bienvenido al sistema de gestión de MT Service Multimarca. Aquí
              podrás acceder a todas las funcionalidades para las que tienes
              permiso.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Si necesitas acceso a funcionalidades adicionales, por favor
              contacta al administrador del sistema.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
