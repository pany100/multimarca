"use client";

import EditarOrdenReparacionForm from "@/components/orden-reparacion/EditarOrdenReparacionForm";
import authFetch from "@/utils/authFetch";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditarOrdenReparacionPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [ordenReparacion, setOrdenReparacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdenReparacion = async () => {
      try {
        const response = await authFetch(`/api/orden-reparacion/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrdenReparacion(data);
        } else {
          console.error("Error al obtener la orden de reparación");
        }
      } catch (error) {
        console.error("Error al obtener la orden de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenReparacion();
  }, [params.id]);

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
          Editar Orden de Reparación
        </Typography>

        {ordenReparacion && (
          <EditarOrdenReparacionForm ordenReparacion={ordenReparacion} />
        )}

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
          Volver a la lista de órdenes
        </Typography>
      </Paper>
    </Box>
  );
};

export default EditarOrdenReparacionPage;
