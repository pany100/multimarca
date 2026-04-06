"use client";

import { Box, Button, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AdminStockPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => router.back()}>
          Volver
        </Button>
        <Typography variant="h5">Administrar stock</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Placeholder
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Página de administración para el stock con ID <b>{params.id}</b>.
          Próximamente: edición avanzada, movimientos, historial, etc.
        </Typography>
      </Paper>
    </Box>
  );
}

