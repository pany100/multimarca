"use client";

import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const VentaAdminPage = () => {
  const params = useParams();
  const ventaId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Administración de Venta con ID: {ventaId}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Esta página está en construcción. Aquí se mostrarán las opciones de
          administración de la venta.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          (Placeholder temporal)
        </Typography>
      </Paper>
    </Box>
  );
};

export default VentaAdminPage;
