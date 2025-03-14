"use client";

import EditarOrdenReparacionForm from "@/components/orden-reparacion/EditarOrdenReparacionForm";
import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";

const EditarOrdenReparacionPage = ({ params }: { params: { id: string } }) => {
  const [ordenReparacion, setOrdenReparacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();

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
        title="Editar Orden de Reparación"
        subheader="Complete los datos para editar la orden de reparación"
      />

      <CardContent>
        {ordenReparacion && (
          <EditarOrdenReparacionForm ordenReparacion={ordenReparacion} />
        )}
      </CardContent>
    </Card>
  );
};

export default EditarOrdenReparacionPage;
