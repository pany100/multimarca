"use client";

import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import ControlesSection from "@/sections/ordenes-reparacion/admin/ControlesSection";
import InformacionGeneralSection from "@/sections/ordenes-reparacion/admin/InformacionGeneralSection";
import MecanicosSection from "@/sections/ordenes-reparacion/admin/MecanicosSection";
import NotasInternasSection from "@/sections/ordenes-reparacion/admin/NotasInternasSection";
import ObservacionesSalidaSection from "@/sections/ordenes-reparacion/admin/ObservacionesSalidaSection";
import ObservacionesUltimoIngresoSection from "@/sections/ordenes-reparacion/admin/ObservacionesUltimoIngresoSection";
import OrdenHeader from "@/sections/ordenes-reparacion/admin/OrdenHeader";
import RepuestosSection from "@/sections/ordenes-reparacion/admin/RepuestosSection";
import { OrdenProvider } from "@/sections/ordenes-reparacion/admin/contexts/OrdenContext";
import { useOrdenReparacion } from "@/sections/ordenes-reparacion/hooks/useOrdenReparacion";
import { Box, CircularProgress, Grid, Paper } from "@mui/material";
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

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <InformacionGeneralSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <ObservacionesUltimoIngresoSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <NotasInternasSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <ObservacionesSalidaSection />
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <ControlesSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <MecanicosSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <RepuestosSection />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </OrdenProvider>
    </SnackbarProvider>
  );
};

export default OrdenReparacionDetailPage;
