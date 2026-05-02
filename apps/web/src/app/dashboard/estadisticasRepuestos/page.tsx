"use client";

import EstadisticasRepuestos from "@/components/estadisticas-repuestos/EstadisticasRepuestos";
import { Box, Typography } from "@mui/material";

export default function EstadisticasRepuestosPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas de Repuestos
      </Typography>
      <EstadisticasRepuestos />
    </Box>
  );
}
