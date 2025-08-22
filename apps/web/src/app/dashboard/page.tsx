"use client";

import { useAuth } from "@/hooks/useAuth";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InfoIcon from "@mui/icons-material/Info";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import Link from "next/link";

const DashboardPage = () => {
  const { userData } = useAuth();
  const theme = useTheme();
  const userName = userData?.fullName || "Usuario";
  const permisos = userData?.permisos || [];

  const accesosPorPermiso = [
    {
      permiso: "Usuarios",
      texto: "Gestionar Usuarios",
      ruta: "/dashboard/usuarios",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
    },
    {
      permiso: "Clientes",
      texto: "Ver Clientes",
      ruta: "/dashboard/clientes",
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.light,
    },
    {
      permiso: "Autos",
      texto: "Gestionar Autos",
      ruta: "/dashboard/autos",
      icon: <DirectionsCarIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
    },
    {
      permiso: "Reparaciones",
      texto: "Órdenes de Reparación",
      ruta: "/dashboard/ordenes-reparacion",
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.dark,
    },
    {
      permiso: "Stock",
      texto: "Revisar Stock",
      ruta: "/dashboard/stock",
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.light,
    },
    {
      permiso: "Ventas",
      texto: "Registrar Venta",
      ruta: "/dashboard/ventas",
      icon: <PointOfSaleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.dark,
    },
  ];

  const accesosDisponibles = accesosPorPermiso.filter((acceso) =>
    permisos.includes(acceso.permiso)
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 500,
          mb: 4,
        }}
      >
        Bienvenido, {userName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              mb: 3,
            }}
          >
            Accesos Rápidos
          </Typography>
          <Grid container spacing={3}>
            {accesosDisponibles.map((acceso, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Link href={acceso.ruta} style={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      height: "100%",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                      },
                      cursor: "pointer",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        p: 3,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                          backgroundColor: alpha(acceso.color, 0.1),
                          color: acceso.color,
                        }}
                      >
                        {acceso.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.primary,
                          mb: 1,
                          fontWeight: 500,
                        }}
                      >
                        {acceso.texto}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              mt: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <InfoIcon
                  sx={{
                    color: theme.palette.primary.main,
                    mr: 1,
                    fontSize: 28,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                >
                  Información General
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                Bienvenido al sistema de gestión de MT Service Multimarca. Aquí
                podrás acceder a todas las funcionalidades para las que tienes
                permiso.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                Si necesitas acceso a funcionalidades adicionales, por favor
                contacta al administrador del sistema.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
