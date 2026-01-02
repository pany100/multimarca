"use client";

import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import ControlesSection from "@/sections/ordenes-reparacion/admin/ControlesSection";
import InformacionGeneralSection from "@/sections/ordenes-reparacion/admin/InformacionGeneralSection";
import MecanicosSection from "@/sections/ordenes-reparacion/admin/MecanicosSection";
import ObservacionesUltimoIngresoSection from "@/sections/ordenes-reparacion/admin/ObservacionesUltimoIngresoSection";
import OrdenHeader from "@/sections/ordenes-reparacion/admin/OrdenHeader";
import PreciosSection from "@/sections/ordenes-reparacion/admin/PreciosSection";
import RepuestosSection from "@/sections/ordenes-reparacion/admin/RepuestosSection";
import TercerosSection from "@/sections/ordenes-reparacion/admin/TercerosSection";
import TrabajosSection from "@/sections/ordenes-reparacion/admin/TrabajosSection";
import { OrdenProvider } from "@/sections/ordenes-reparacion/admin/contexts/OrdenContext";
import { useOrdenReparacion } from "@/sections/ordenes-reparacion/hooks/useOrdenReparacion";
import { Box, CircularProgress, Grid, Paper, Stack } from "@mui/material";
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
    <SnackbarProvider>
      <OrdenProvider orden={ordenReparacion}>
        <Box>
          <OrdenHeader />

          {/* Información General - Ocupa todo el ancho */}
          <Box sx={{ mb: 3 }}>
            <InformacionGeneralSection />
          </Box>

          {/* Grid de 2 columnas para las demás secciones */}
          <Grid container spacing={3}>
            {/* Columna izquierda */}
            <Grid item xs={12}>
              <Stack spacing={3}>
                <ObservacionesUltimoIngresoSection />
                <MecanicosSection />
                <RepuestosSection />
              </Stack>
            </Grid>

            {/* Columna derecha */}
            <Grid item xs={12}>
              <Stack spacing={3}>
                <ControlesSection />
                <TrabajosSection />
                <TercerosSection />
                <PreciosSection />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </OrdenProvider>
    </SnackbarProvider>
  );
};

export default OrdenReparacionDetailPage;
