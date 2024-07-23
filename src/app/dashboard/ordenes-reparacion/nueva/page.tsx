"use client";

import NuevaOrdenReparacionForm from "@/components/orden-reparacion/NuevaOrdenReparacionForm";
import { Box, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Orden de Reparación
        </Typography>

        <NuevaOrdenReparacionForm />

        <Typography
          variant="body2"
          component="p"
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "primary.main",
          }}
          onClick={() => router.back()}
        >
          Volver a la lista de órdenes
        </Typography>
      </Paper>
    </Box>
  );
};

export default NuevaOrdenReparacionPage;
