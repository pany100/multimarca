"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import NuevaPlantillaForm from "@/components/plantilla-presupuesto/NuevaPlantillaForm";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Nueva Plantilla de Presupuesto"
        subheader="Complete los datos para crear una nueva plantilla de presupuesto"
      />

      <CardContent>
        <SnackbarProvider>
          <NuevaPlantillaForm />
          <FormSnackbar />
        </SnackbarProvider>
      </CardContent>
    </Card>
  );
};

export default NuevaOrdenReparacionPage;
