"use client";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { getStatusColor } from "@/utils/ordenHelper";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VerAutoPage = ({ params }: { params: { id: string } }) => {
  const [auto, setAuto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useFetch();
  const router = useRouter();
  const { userData, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Autos")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

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
              <strong>Combustible:</strong> {auto.tipoCombustible || "N/A"}
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
          <Grid item xs={12}>
            {(() => {
              const cedulaSrc =
                auto.cedulaVerdeFile?.finalPath ??
                auto.cedulaVerdeFile?.tempPath ??
                auto.cedulaVerdePath;
              if (!cedulaSrc) return null;
              return (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Cédula de identificación automotor
                  </Typography>
                  <Image
                    src={cedulaSrc}
                    alt="Cédula Verde"
                    width={300}
                    height={200}
                    style={{ width: "300px", height: "auto" }}
                  />
                </Box>
              );
            })()}
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          <BuildIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Órdenes de Reparación Previas
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Observaciones de Entrada</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Monto Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auto.ordenesReparacion.map((orden: any) => (
                <TableRow
                  key={orden.id}
                  onClick={() => {
                    window.location.href = `/dashboard/ordenes-reparacion/${orden.id}/ver`;
                  }}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <TableCell>
                    {new Date(orden.fechaCreacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{orden.observacionesCliente}</TableCell>
                  <TableCell>
                    <Chip
                      label={orden.estado}
                      color={getStatusColor(orden.estado)}
                    />
                  </TableCell>
                  <TableCell>{getFormattedPrice(orden.totalAPagar)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default VerAutoPage;
