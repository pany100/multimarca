"use client";

import Balance from "@/components/estadisticas/Balance";
import ComparacionStock from "@/components/estadisticas/ComparacionStock";
import Extracciones from "@/components/estadisticas/Extracciones";
import GastoEmpleados from "@/components/estadisticas/GastoEmpleados";
import Gastos from "@/components/estadisticas/Gastos";
import Marcas from "@/components/estadisticas/Marcas";
import Reparaciones from "@/components/estadisticas/Reparaciones";
import Stock from "@/components/estadisticas/Stock";
import TiposDeOperacion from "@/components/estadisticas/TiposDeOperacion";
import Ventas from "@/components/estadisticas/Ventas";
import { useAuth } from "@/hooks/useAuth";
import { Card, Grid, Typography } from "@mui/material";

const EstadisticasPage = () => {
  const { userData } = useAuth();
  const permisos = userData?.permisos || [];
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas
      </Typography>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {permisos.includes("EstadisticasBalance") && (
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card
              sx={{ width: "100%", display: "flex", flexDirection: "column" }}
            >
              <Balance />
            </Card>
          </Grid>
        )}
        {permisos.includes("EstadisticasExtracciones") && (
          <Grid item xs={12} md={6} sx={{ display: "flex" }}>
            <Card
              sx={{ width: "100%", display: "flex", flexDirection: "column" }}
            >
              <Extracciones />
            </Card>
          </Grid>
        )}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Ventas />
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Reparaciones />
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <ComparacionStock />
          </Card>
        </Grid>
        <Grid item xs={12} md={12} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Stock />
          </Card>
        </Grid>
        <Grid item xs={12} md={12} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Marcas />
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <Gastos />
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <GastoEmpleados />
          </Card>
        </Grid>
        <Grid item xs={12} md={12} sx={{ display: "flex" }}>
          <Card
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <TiposDeOperacion />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default EstadisticasPage;
