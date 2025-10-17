"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExtraccionVerPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { authFetch } = useFetch();
  const [extraccion, setExtraccion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  useEffect(() => {
    const fetchExtraccion = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`/api/extracciones/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setExtraccion(data);
        } else {
          setError("Error al obtener la extracción");
        }
      } catch (err) {
        setError("Error al cargar los datos de la extracción");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraccion();
  }, [params.id, authFetch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !extraccion) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error || "No se pudo cargar la extracción"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        mb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
            onClick={() => router.back()}
          >
            Volver
          </Button>
          <Typography variant="h5" component="h1">
            Extracción #{extraccion.id}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Basic Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Fecha
          </Typography>
          <Typography variant="body1">
            {getFormattedDate(extraccion.fecha)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Monto
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {getFormattedPrice(extraccion.monto)}{" "}
            <Chip
              label={extraccion.moneda}
              color={extraccion.moneda === "Dolar" ? "success" : "warning"}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Gastos Bancarios
          </Typography>
          <Typography variant="body1">
            {getFormattedPrice(extraccion.gastosBancarios)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Usuario
          </Typography>
          <Typography variant="body1">
            {extraccion.usuario?.fullName || "No especificado"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Tipo de Operación
          </Typography>
          <Typography variant="body1">
            {extraccion.tipoOperacion?.label &&
            extraccion.tipoOperacion.label === "Cheque" &&
            extraccion.chequeId ? (
              <Link
                href={`/dashboard/cheques/${extraccion.chequeId}`}
                style={{ textDecoration: "underline" }}
              >
                Cheque{" "}
                {extraccion.cheque?.rechazado ? "(Rechazado, revisar)" : ""}
              </Link>
            ) : (
              extraccion.tipoOperacion?.label || "No especificado"
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Motivo
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              mt: 1,
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography variant="body1">
              {extraccion.motivo || "Sin motivo especificado"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Dolar Info if applicable */}
      {extraccion.moneda === "Dolar" && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Cotización del Dólar
          </Typography>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {getFormattedPrice(extraccion.cotizacionDolar)}
            </Typography>
          </Grid>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
