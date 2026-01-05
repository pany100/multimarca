"use client";

import VentaHeader from "@/components/ventas/VentaHeader/VentaHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { VentaProvider } from "@/sections/ventas/admin/contexts/VentaContext";
import { useVenta } from "@/sections/ventas/hooks/useVenta";
import { Box, CircularProgress, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const VentaAdminPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { venta, loading, error } = useVenta(params.id);

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Ventas")) {
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

  if (!venta) {
    return (
      <Box sx={{ p: 3 }}>
        <Box>No se encontró la venta</Box>
      </Box>
    );
  }

  return (
    <SnackbarProvider>
      <VentaProvider venta={venta}>
        <Box sx={{ px: 3 }}>
          <VentaHeader />

          <Grid container spacing={3} alignItems="stretch">
            {/* Aquí irán las secciones de administración */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                }}
              >
                Secciones de administración por implementar
              </Box>
            </Grid>
          </Grid>
        </Box>
      </VentaProvider>
    </SnackbarProvider>
  );
};

export default VentaAdminPage;
