"use client";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VerEmpleadoPage = ({ params }: { params: { id: string } }) => {
  const [empleado, setEmpleado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Mecanicos")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        const response = await authFetch(`/api/mecanicos/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setEmpleado(data);
        } else {
          console.error("Error al obtener el empleado");
        }
      } catch (error) {
        console.error("Error al obtener el empleado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
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
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Typography variant="h4" gutterBottom>
          Empleado: {empleado.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Empleado
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {empleado.name}
            </Typography>
            <Typography>
              <strong>DNI:</strong> {empleado.dni}
            </Typography>
            <Typography>
              <strong>Email:</strong> {empleado.email}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {empleado.phone}
            </Typography>
            <Typography>
              <strong>Dirección:</strong> {empleado.address}
            </Typography>
            <Typography>
              <strong>Ciudad:</strong> {empleado.city}
            </Typography>
            <Typography>
              <strong>Provincia:</strong> {empleado.state}
            </Typography>
            <Typography>
              <strong>Código Postal:</strong> {empleado.postal_code}
            </Typography>
            <Typography>
              <strong>Tipo:</strong> {empleado.tipo}
            </Typography>
            <Typography>
              <strong>Fecha de inicio:</strong>{" "}
              {empleado.start_date
                ? new Date(empleado.start_date).toLocaleDateString()
                : "-"}
            </Typography>
            <Typography>
              <strong>Fecha de nacimiento:</strong>{" "}
              {empleado.birthday
                ? new Date(empleado.birthday).toLocaleDateString()
                : "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VerEmpleadoPage;
