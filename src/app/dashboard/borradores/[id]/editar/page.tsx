"use client";

import EditarBorradorForm from "@/components/borrador/EditarBorradorForm";
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

const EditarBorradorPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [borrador, setBorrador] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  useEffect(() => {
    const fetchBorrador = async () => {
      try {
        const response = await authFetch(`/api/borradores/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setBorrador(data);
        } else {
          console.error("Error al obtener el borrador");
        }
      } catch (error) {
        console.error("Error al obtener el borrador:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrador();
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
        title="Editar Borrador"
        subheader="Complete los datos para editar el borrador"
      />
      <CardContent>
        {borrador && (
          <SnackbarProvider>
            <EditarBorradorForm borrador={borrador} />
          </SnackbarProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default EditarBorradorPage;
