"use client";

import EstadoCajaTable from "@/sections/estado-caja/EstadoCajaTable";
import { Box, Typography } from "@mui/material";

export default function EstadoCajaPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Estado de caja
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Ingresos, egresos y saldo por medio de pago.
      </Typography>
      <EstadoCajaTable />
    </Box>
  );
}
