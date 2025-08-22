"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import NuevaVentaForm from "@/components/ventas/form/NuevaVentaForm";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NuevaVentaPage = () => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Ventas")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Nueva Venta"
        subheader="Complete los datos para crear una nueva venta"
      />

      <CardContent>
        <SnackbarProvider>
          <NuevaVentaForm />
          <FormSnackbar />
        </SnackbarProvider>
      </CardContent>
    </Card>
  );
};

export default NuevaVentaPage;
