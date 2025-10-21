"use client";

import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const GastoDetallePage = ({ params }: { params: { id: string } }) => {
  const [gasto, setGasto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const fetchGasto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/api/gastos/${params.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar el gasto");
      }

      const data = await response.json();
      setGasto(data);
    } catch (err: any) {
      console.error("Error fetching gasto:", err);
      setError(err.message || "Ha ocurrido un error al cargar el gasto");
    } finally {
      setLoading(false);
    }
  }, [authFetch, params.id]);

  useEffect(() => {
    fetchGasto();
  }, [fetchGasto]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 3,
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          component={Link}
          href="/dashboard/gastos"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Volver a Gastos
        </Button>
      </Box>
    );
  }

  if (!gasto) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 3,
        }}
      >
        <Typography variant="h6">Gasto no encontrado</Typography>
        <Button
          component={Link}
          href="/dashboard/gastos"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Volver a Gastos
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Detalle de Gasto
        </Typography>
        <Button
          component={Link}
          href="/dashboard/gastos"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Volver a Gastos
        </Button>
      </Stack>

      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {gasto.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {gasto.nombre}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(gasto.fecha)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Categoría
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {gasto.categoria?.nombre || "Sin categoría"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Monto
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {getFormattedPrice(gasto.precio)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Gastos Bancarios
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getFormattedPrice(gasto.gastosBancarios)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Gastos ARBA
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {getFormattedPrice(gasto.gastosArba)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tipo de Operación
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {gasto.tipoOperacion?.label || "N/A"}
                  </Typography>
                </Box>
                {gasto.proveedor && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Proveedor
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {gasto.proveedor.name}
                    </Typography>
                  </Box>
                )}
                {gasto.mecanico && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mecánico
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {gasto.mecanico.name}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>

          {gasto.detalle && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Detalle
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {gasto.detalle}
                </Typography>
              </Box>
            </>
          )}

          {gasto.cheque && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información del Cheque
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Número
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {gasto.cheque.numero}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Banco
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {gasto.cheque.banco}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary">
                      Fecha de Cobro
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(gasto.cheque.fechaCobro)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          {/* Dolar Info if applicable */}
          {gasto.moneda === "Dolar" && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Cotización del Dólar
              </Typography>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  {getFormattedPrice(gasto.cotizacionDolar)}
                </Typography>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GastoDetallePage;
