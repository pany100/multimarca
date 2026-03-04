"use client";
import { useFetch } from "@/contexts/FetchContext";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const VerAutoPage = ({ params }: { params: { id: string } }) => {
  const [auto, setAuto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchAuto = async () => {
      try {
        const response = await authFetch(`/api/autos/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setAuto(data);
        } else {
          console.error("Error al obtener el auto");
        }
      } catch (error) {
        console.error("Error al obtener el auto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuto();
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Auto: {auto.brand} {auto.model}
          </Typography>
          <Chip
            icon={<DirectionsCarIcon />}
            label={auto.patent}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <DirectionsCarIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Vehículo
            </Typography>
            <Typography>
              <strong>Marca:</strong> {auto.brand}
            </Typography>
            <Typography>
              <strong>Modelo:</strong> {auto.model}
            </Typography>
            <Typography>
              <strong>Año:</strong> {auto.year}
            </Typography>
            <Typography>
              <strong>Color:</strong> {auto.color}
            </Typography>
            <Typography>
              <strong>Kilómetros:</strong> {auto.kms}
            </Typography>
            <Typography>
              <strong>Número de Chasis:</strong> {auto.chassis_number}
            </Typography>
            <Typography>
              <strong>Número de Motor:</strong> {auto.engine_number}
            </Typography>
            <Typography>
              <strong>Tipo de Transmisión:</strong> {auto.transmission_type}
            </Typography>
            <Typography>
              <strong>Combustible:</strong> {auto.tipoCombustible || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Información del Propietario
            </Typography>
            <Typography>
              <strong>Nombre:</strong> {auto.owner.fullName}
            </Typography>
            <Typography>
              <strong>Teléfono:</strong> {auto.owner.phone}
            </Typography>
            <Typography>
              <strong>Email:</strong> {auto.owner.email}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <BuildIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Observaciones
        </Typography>
        <Typography paragraph>
          {auto.observations || "Sin observaciones"}
        </Typography>
      </Paper>
    </Box>
  );
};

export default VerAutoPage;
