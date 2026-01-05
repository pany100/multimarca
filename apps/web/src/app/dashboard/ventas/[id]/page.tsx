"use client";

import VentaHeader from "@/components/ventas/VentaHeader/VentaHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { VentaProvider } from "@/sections/ventas/admin/contexts/VentaContext";
import VentaCostosSection from "@/sections/ventas/admin/VentaCostosSection";
import VentaInformacionGeneral from "@/sections/ventas/admin/VentaInformacionGeneral";
import VentaRecargoSection from "@/sections/ventas/admin/VentaRecargoSection";
import VentaRepuestosSection from "@/sections/ventas/admin/VentaRepuestosSection";
import VentaTercerosSection from "@/sections/ventas/admin/VentaTercerosSection";
import VentaTrabajosSection from "@/sections/ventas/admin/VentaTrabajosSection";
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
            {/* Información General */}
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <VentaInformacionGeneral />
              </Box>
            </Grid>
          </Grid>

          {/* Repuestos, Terceros y Trabajos */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <VentaRepuestosSection />
            </Grid>
            <Grid item xs={12}>
              <VentaTercerosSection />
            </Grid>
            <Grid item xs={12}>
              <VentaRecargoSection />
            </Grid>
            <Grid item xs={12}>
              <VentaTrabajosSection />
            </Grid>
            <Grid item xs={12}>
              <VentaCostosSection />
            </Grid>
          </Grid>
        </Box>
      </VentaProvider>
    </SnackbarProvider>
  );
};

export default VentaAdminPage;
