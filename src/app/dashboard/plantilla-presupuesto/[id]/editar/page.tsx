"use client";

import EditarPlantillaForm from "@/components/orden-reparacion/EditarPlantillaForm";
import { useFetch } from "@/contexts/FetchContext";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditarPlantillaPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchPlantilla = async () => {
      try {
        const response = await authFetch(
          `/api/plantilla-presupuesto/${params.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setPlantilla(data);
        } else {
          console.error("Error al obtener la plantilla");
        }
      } catch (error) {
        console.error("Error al obtener la plantilla:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantilla();
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
          Editar Plantilla de Presupuesto
        </Typography>

        {plantilla && <EditarPlantillaForm plantilla={plantilla} />}

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
          Volver a la lista
        </Typography>
      </Paper>
    </Box>
  );
};

export default EditarPlantillaPage;
