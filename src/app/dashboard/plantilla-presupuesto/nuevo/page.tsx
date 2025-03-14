"use client";

import NuevaPlantillaForm from "@/components/orden-reparacion/NuevaPlantillaForm";
import { useAuth } from "@/hooks/useAuth";
import { Box, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nueva Plantilla de Presupuesto
        </Typography>

        <NuevaPlantillaForm />
      </Paper>
    </Box>
  );
};

export default NuevaOrdenReparacionPage;
