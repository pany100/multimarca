"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { useFetch } from "@/contexts/FetchContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { IngresoVentaProvider } from "@/sections/ingresos-ventas/admin/contexts/IngresoVentaContext";
import IngresoVentaEstadoSection from "@/sections/ingresos-ventas/admin/IngresoVentaEstadoSection";
import IngresoVentaGastosSection from "@/sections/ingresos-ventas/admin/IngresoVentaGastosSection";
import IngresoVentaInfoSection from "@/sections/ingresos-ventas/admin/IngresoVentaInfoSection";
import IngresoVentaVentaSection from "@/sections/ingresos-ventas/admin/IngresoVentaVentaSection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const IngresoVentaAdminPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { authFetch } = useFetch();

  const [ingreso, setIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Ventas") && !permisos.includes("Ingresos")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  useEffect(() => {
    const fetchIngreso = async () => {
      try {
        const response = await authFetch(`/api/ingresos-ventas/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setIngreso(data);
        }
      } catch (error) {
        console.error("Error al obtener el ingreso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngreso();
  }, [params.id, authFetch]);

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

  if (!ingreso) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontró el ingreso</Typography>
      </Box>
    );
  }

  return (
    <SnackbarProvider>
      <IngresoVentaProvider ingreso={ingreso}>
        <Box sx={{ px: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
              onClick={() => router.push("/dashboard/ingresos-ventas")}
            >
              Volver
            </Button>
            <Typography variant="h5" component="h1">
              Ingreso por Venta #{ingreso.id}
            </Typography>
          </Box>

          {/* Secciones */}
          <Grid container spacing={3}>
            {/* Info del pago + Venta asociada */}
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoVentaInfoSection />
              </Box>
            </Grid>
            <Grid item xs={12} xl={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoVentaVentaSection />
              </Box>
            </Grid>

            {/* Gastos + Estado */}
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoVentaGastosSection />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoVentaEstadoSection />
              </Box>
            </Grid>
          </Grid>
        </Box>
        <FormSnackbar />
      </IngresoVentaProvider>
    </SnackbarProvider>
  );
};

export default IngresoVentaAdminPage;
