"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { useFetch } from "@/contexts/FetchContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { IngresoReparacionProvider } from "@/sections/ingresos-reparacion/admin/contexts/IngresoReparacionContext";
import IngresoReparacionDetalleOrdenSection from "@/sections/ingresos-reparacion/admin/IngresoReparacionDetalleOrdenSection";
import IngresoReparacionGastosSection from "@/sections/ingresos-reparacion/admin/IngresoReparacionGastosSection";
import IngresoReparacionHeader from "@/sections/ingresos-reparacion/admin/IngresoReparacionHeader";
import IngresoReparacionInfoSection from "@/sections/ingresos-reparacion/admin/IngresoReparacionInfoSection";
import IngresoReparacionOrdenSection from "@/sections/ingresos-reparacion/admin/IngresoReparacionOrdenSection";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const IngresoReparacionAdminPage = ({
  params,
}: {
  params: { id: string };
}) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  const { authFetch } = useFetch();

  const [ingreso, setIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (
        !permisos.includes("Reparaciones") &&
        !permisos.includes("Ingresos")
      ) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  useEffect(() => {
    const fetchIngreso = async () => {
      try {
        const response = await authFetch(
          `/api/ingresos-reparacion/${params.id}`
        );
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
        <Typography>No se encontro el ingreso</Typography>
      </Box>
    );
  }

  return (
    <SnackbarProvider>
      <IngresoReparacionProvider ingreso={ingreso}>
        <Box sx={{ px: 3 }}>
          <IngresoReparacionHeader />

          {/* Fila 1: Informacion del pago + Gastos */}
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={8} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoReparacionInfoSection />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoReparacionGastosSection />
              </Box>
            </Grid>
          </Grid>

          {/* Fila 2: Orden asociada + Detalle de la orden */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <IngresoReparacionOrdenSection />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <IngresoReparacionDetalleOrdenSection />
            </Grid>
          </Grid>
        </Box>
        <FormSnackbar />
      </IngresoReparacionProvider>
    </SnackbarProvider>
  );
};

export default IngresoReparacionAdminPage;
