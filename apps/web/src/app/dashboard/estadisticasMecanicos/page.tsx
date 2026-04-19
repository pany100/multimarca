"use client";

import EstadisticasMecanicos from "@/components/estadisticas-mecanicos/EstadisticasMecanicos";
import { Box, Typography } from "@mui/material";

export default function EstadisticasMecanicosPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas de Mecánicos
      </Typography>
      <EstadisticasMecanicos />
    </Box>
  );
}
