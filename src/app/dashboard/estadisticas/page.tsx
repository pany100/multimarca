"use client";

import Ventas from "@/components/estadisticas/Ventas";
import { Card, Grid, Typography } from "@mui/material";

const EstadisticasPage = () => {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <Ventas />
          </Card>
        </Grid>
        {/* Aquí puedes agregar más componentes de estadísticas */}
      </Grid>
    </div>
  );
};

export default EstadisticasPage;
