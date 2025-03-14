"use client";

import EditarPlantillaForm from "@/components/orden-reparacion/EditarPlantillaForm";
import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
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
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Editar Plantilla de Presupuesto"
        subheader="Complete los datos para editar la plantilla"
      />
      <CardContent>
        {plantilla && <EditarPlantillaForm plantilla={plantilla} />}
      </CardContent>
    </Card>
  );
};

export default EditarPlantillaPage;
