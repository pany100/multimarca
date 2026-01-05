"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import PresupuestoHeader from "@/components/orden-reparacion/presupuesto/PresupuestoHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { PresupuestoProvider } from "@/sections/presupuestos/admin/contexts/PresupuestoContext";
import PresupuestoInformacionGeneral from "@/sections/presupuestos/admin/PresupuestoInformacionGeneral";
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
        <Box>
          <PresupuestoHeader />

          <Grid container spacing={3} alignItems="stretch">
            {/* Información General */}
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <PresupuestoInformacionGeneral />
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
