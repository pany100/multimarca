"use client";

import { useAuth } from "@/hooks/useAuth";
import { useOrdenReparacion } from "@/sections/ordenes-reparacion/hooks/useOrdenReparacion";
import { Box, CircularProgress, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const OrdenReparacionDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { ordenReparacion, loading, error } = useOrdenReparacion(params.id);

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!ordenReparacion) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box>No se encontró la orden de reparación</Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Box>
        <h1>Administrar Orden #{ordenReparacion.id}</h1>
        <p>Estado: {ordenReparacion.estado}</p>
        <p>
          Auto: {ordenReparacion.auto?.brand} {ordenReparacion.auto?.model}
        </p>
        {/* Aquí irá el contenido de administración */}
      </Box>
    </Paper>
  );
};

export default OrdenReparacionDetailPage;
