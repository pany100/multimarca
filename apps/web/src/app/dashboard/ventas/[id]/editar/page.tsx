"use client";

import EditarVentaForm from "@/components/ventas/form/EditarVentaForm";
import { useFetch } from "@/contexts/FetchContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditarVentaPage = ({ params }: { params: { id: string } }) => {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
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

  useEffect(() => {
    const fetchVenta = async () => {
      try {
        const response = await authFetch(`/api/ventas/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVenta(data);
        } else {
          console.error("Error al obtener la venta");
        }
      } catch (error) {
        console.error("Error al obtener la venta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenta();
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

  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Editar Venta"
        subheader="Complete los datos para editar la venta"
      />

      <CardContent>
        {venta && (
          <SnackbarProvider>
            <EditarVentaForm venta={venta} />
          </SnackbarProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default EditarVentaPage;
