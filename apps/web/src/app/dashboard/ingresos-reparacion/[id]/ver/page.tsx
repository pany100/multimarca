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

export default function IngresoReparacionVerPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { authFetch } = useFetch();
  const [ingreso, setIngreso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    const fetchIngresoReparacion = async () => {
      try {
        setLoading(true);
        const response = await authFetch(
          `/api/ingresos-reparacion/${params.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIngreso(data);
        } else {
          setError("Error al obtener el ingreso por reparación");
        }
      } catch (err) {
        setError("Error al cargar los datos del ingreso por reparación");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresoReparacion();
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

  if (error || !ingreso) {
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
          {error || "No se pudo cargar el ingreso por reparación"}
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
            Ingreso por Reparación #{ingreso.id}
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
            {getFormattedDate(ingreso.fecha)}
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
            {getFormattedPrice(ingreso.monto)}{" "}
            <Chip
              label={ingreso.moneda}
              color={ingreso.moneda === "Dolar" ? "success" : "warning"}
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
            {getFormattedPrice(ingreso.gastosBancarios)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Gastos ARBA
          </Typography>
          <Typography variant="body1">
            {getFormattedPrice(ingreso.gastosArba)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Cliente
          </Typography>
          <Typography variant="body1">
            {ingreso.cliente?.fullName || "No especificado"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold">
            Tipo de Operación
          </Typography>
          <Typography variant="body1">
            {ingreso.tipoOperacion?.label &&
            ingreso.tipoOperacion.label === "Cheque" &&
            ingreso.chequeId ? (
              <Link
                href={`/dashboard/cheques/${ingreso.chequeId}`}
                style={{ textDecoration: "underline" }}
              >
                Cheque {ingreso.cheque?.rechazado ? "(Rechazado, revisar)" : ""}
              </Link>
            ) : (
              ingreso.tipoOperacion?.label || "No especificado"
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Descripción
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
              {ingreso.descripcion || "Sin descripción"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Orden de Reparación Info */}
      {ingreso.ordenReparacion && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Información de la Orden de Reparación
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              mt: 1,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Orden de Reparación
                </Typography>
                <Typography variant="body1">
                  <Link
                    href={`/dashboard/ordenes-reparacion/${ingreso.ordenReparacion.id}/ver`}
                    style={{ textDecoration: "underline" }}
                  >
                    Orden #{ingreso.ordenReparacion.id}
                  </Link>
                </Typography>
              </Grid>
              {ingreso.ordenReparacion.auto && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vehículo
                    </Typography>
                    <Typography variant="body1">
                      {ingreso.ordenReparacion.auto.brand}{" "}
                      {ingreso.ordenReparacion.auto.model}{" "}
                      {ingreso.ordenReparacion.auto.patent
                        ? `(${ingreso.ordenReparacion.auto.patent})`
                        : ""}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </>
      )}

      {/* Dolar Info if applicable */}
      {ingreso.moneda === "Dolar" && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Cotización del Dólar
          </Typography>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              {getFormattedPrice(ingreso.cotizacionDolar)}
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
