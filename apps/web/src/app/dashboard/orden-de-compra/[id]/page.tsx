"use client";

import OrdenDeCompraHeader from "@/components/orden-de-compra/OrdenDeCompraHeader/OrdenDeCompraHeader";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { OrdenDeCompraProvider } from "@/sections/orden-de-compra/admin/contexts/OrdenDeCompraContext";
import OrdenDeCompraInfoSection from "@/sections/orden-de-compra/admin/OrdenDeCompraInfoSection";
import OrdenDeCompraItemsSection from "@/sections/orden-de-compra/admin/OrdenDeCompraItemsSection";
import PercepcionSection from "@/sections/orden-de-compra/admin/PercepcionSection";
import ResumenOrdenCompraSection from "@/sections/orden-de-compra/admin/ResumenOrdenCompraSection";
import { useOrdenDeCompra } from "@/sections/orden-de-compra/hooks/useOrdenDeCompra";
import { Box, CircularProgress, Grid } from "@mui/material";

const OrdenDeCompraAdminPage = ({ params }: { params: { id: string } }) => {
  const { orden, loading, error } = useOrdenDeCompra(params.id);

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

  if (!orden) {
    return (
      <Box sx={{ p: 3 }}>
        <Box>No se encontró la orden de compra</Box>
      </Box>
    );
  }

  return (
    <SnackbarProvider>
      <OrdenDeCompraProvider orden={orden}>
        <Box sx={{ px: 3 }}>
          <OrdenDeCompraHeader />

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12}>
              <OrdenDeCompraInfoSection />
            </Grid>
            <Grid item xs={12}>
              <OrdenDeCompraItemsSection />
            </Grid>
            <Grid item xs={12}>
              <PercepcionSection />
            </Grid>
            <Grid item xs={12}>
              <ResumenOrdenCompraSection />
            </Grid>
          </Grid>
        </Box>
      </OrdenDeCompraProvider>
    </SnackbarProvider>
  );
};

export default OrdenDeCompraAdminPage;
