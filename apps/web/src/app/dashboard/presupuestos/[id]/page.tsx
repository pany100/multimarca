"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import PresupuestoHeader from "@/components/orden-reparacion/presupuesto/PresupuestoHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { PresupuestoProvider } from "@/sections/presupuestos/admin/contexts/PresupuestoContext";
import PresupuestoAjustesPrecioSection from "@/sections/presupuestos/admin/PresupuestoAjustesPrecioSection";
import PresupuestoCostosSection from "@/sections/presupuestos/admin/PresupuestoCostosSection";
import PresupuestoInformacionGeneral from "@/sections/presupuestos/admin/PresupuestoInformacionGeneral";
import PresupuestoRecargoSection from "@/sections/presupuestos/admin/PresupuestoRecargoSection";
import PresupuestoRepuestosSection from "@/sections/presupuestos/admin/PresupuestoRepuestosSection";
import PresupuestoTareasAdministrativas from "@/sections/presupuestos/admin/PresupuestoTareasAdministrativas";
import PresupuestoTercerosSection from "@/sections/presupuestos/admin/PresupuestoTercerosSection";
import PresupuestoTrabajosARealizar from "@/sections/presupuestos/admin/PresupuestoTrabajosARealizar";
import PresupuestoTrabajosSection from "@/sections/presupuestos/admin/PresupuestoTrabajosSection";
import { usePresupuesto } from "@/sections/presupuestos/hooks/usePresupuesto";
import { Box, CircularProgress, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PresupuestoAdminPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { presupuesto, loading, error } = usePresupuesto(params.id);

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

  if (!presupuesto) {
    return (
      <Box sx={{ p: 3 }}>
        <Box>No se encontró el presupuesto</Box>
      </Box>
    );
  }

  return (
    <SnackbarProvider>
      <PresupuestoProvider presupuesto={presupuesto}>
        <Box sx={{ px: 3 }}>
          <PresupuestoHeader />

          <Grid container spacing={3} alignItems="stretch">
            {/* Información General */}
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoInformacionGeneral />
              </Box>
            </Grid>

            {/* Tareas Administrativas */}
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoTareasAdministrativas />
              </Box>
            </Grid>

            {/* Trabajos a Realizar */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoTrabajosARealizar />
              </Box>
            </Grid>

            {/* Reparaciones de Terceros */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoTercerosSection />
              </Box>
            </Grid>

            {/* Repuestos */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoRepuestosSection />
              </Box>
            </Grid>

            {/* Recargo */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoRecargoSection />
              </Box>
            </Grid>

            {/* Trabajos Realizados */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoTrabajosSection />
              </Box>
            </Grid>

            {/* Incrementos y Descuentos */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoAjustesPrecioSection />
              </Box>
            </Grid>

            {/* Costos */}
            <Grid item xs={12} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoCostosSection />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </PresupuestoProvider>
      <FormSnackbar />
    </SnackbarProvider>
  );
};

export default PresupuestoAdminPage;
