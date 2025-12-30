"use client";

import { useAuth } from "@/hooks/useAuth";
import OrdenHeader from "@/sections/ordenes-reparacion/admin/OrdenHeader";
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
    <Box>
      <OrdenHeader orden={ordenReparacion} />
    </Box>
  );
};

export default OrdenReparacionDetailPage;
