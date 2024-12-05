"use client";

import EditarBorradorForm from "@/components/orden-reparacion/EditarBorradorForm";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
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
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Borrador
        </Typography>

        {borrador && <EditarBorradorForm borrador={borrador} />}

        <Typography
          variant="body2"
          component="p"
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "primary.main",
            marginTop: 2,
          }}
          onClick={() => router.back()}
        >
          Volver a la lista de borradores
        </Typography>
      </Paper>
    </Box>
  );
};

export default EditarBorradorPage;
