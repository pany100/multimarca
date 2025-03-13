"use client";

import NuevaOrdenForm from "@/components/orden-reparacion/NuevaOrdenForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
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
        title="Nueva Orden de Reparación"
        subheader="Complete los datos para crear una nueva orden de reparación"
      />

      <CardContent>
        <NuevaOrdenForm />
      </CardContent>

      <Typography
        variant="body2"
        component="p"
        sx={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "primary.main",
        }}
        onClick={() => router.back()}
      >
        Volver a la lista de órdenes
      </Typography>
    </Card>
  );
};

export default NuevaOrdenReparacionPage;
