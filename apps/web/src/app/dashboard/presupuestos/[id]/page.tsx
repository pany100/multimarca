"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import PresupuestoHeader from "@/components/orden-reparacion/presupuesto/PresupuestoHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { PresupuestoProvider } from "@/sections/presupuestos/admin/contexts/PresupuestoContext";
import { usePresupuesto } from "@/sections/presupuestos/hooks/usePresupuesto";
import { Box, CircularProgress, Grid, Paper } from "@mui/material";
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
      <Paper sx={{ p: 3 }}>
        <Box>No se encontró el presupuesto</Box>
      </Paper>
    );
  }

  return (
    <SnackbarProvider>
      <PresupuestoProvider presupuesto={presupuesto}>
        <Box>
          <PresupuestoHeader />

          <Grid container spacing={3} alignItems="stretch">
            {/* Aquí se agregarán las secciones */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box>Secciones de administración se agregarán aquí</Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </PresupuestoProvider>
      <FormSnackbar />
    </SnackbarProvider>
  );
};

export default PresupuestoAdminPage;
