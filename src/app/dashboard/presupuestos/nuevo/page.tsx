"use client";

import NuevoPresupuestoForm from "@/components/orden-reparacion/NuevoPresupuestoForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const NuevaOrdenReparacionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  const templateId = searchParams.get("templateId");
  const templateIdInt = templateId ? parseInt(templateId, 10) : null;

  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Nuevo Presupuesto"
        subheader="Complete los datos para crear un nuevo presupuesto"
      />
      <CardContent>
        <NuevoPresupuestoForm templateId={templateIdInt} />
      </CardContent>
    </Card>
  );
};

export default NuevaOrdenReparacionPage;
