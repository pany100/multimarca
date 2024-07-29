"use client";

import Extracciones from "@/components/estadisticas/Extracciones";
import Marcas from "@/components/estadisticas/Marcas";
import Reparaciones from "@/components/estadisticas/Reparaciones";
import Stock from "@/components/estadisticas/Stock";
import Ventas from "@/components/estadisticas/Ventas";
import { Card, Grid, Typography } from "@mui/material";

const EstadisticasPage = () => {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas
      </Typography>
      <Grid container spacing={2} sx={{ height: "100%" }}>
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
            <Stock />
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
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
            <Extracciones />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default EstadisticasPage;
