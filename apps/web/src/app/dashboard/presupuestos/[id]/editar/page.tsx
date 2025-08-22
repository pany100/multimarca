"use client";

import EditarPresupuestoForm from "@/components/presupuesto/EditarPresupuestoForm";
import { useFetch } from "@/contexts/FetchContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";

const EditarPresupuestoPage = ({ params }: { params: { id: string } }) => {
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchPresupuesto = async () => {
      try {
        const response = await authFetch(`/api/presupuestos/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPresupuesto(data);
        } else {
          console.error("Error al obtener el presupuesto");
        }
      } catch (error) {
        console.error("Error al obtener el presupuesto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuesto();
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
        title="Editar Presupuesto"
        subheader="Complete los datos para editar el presupuesto"
      />

      <CardContent>
        {presupuesto && (
          <SnackbarProvider>
            <EditarPresupuestoForm presupuesto={presupuesto} />
          </SnackbarProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default EditarPresupuestoPage;
