"use client";

import usePerdida from "@/sections/perdida/hooks/usePerdida";
import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

function RecuperoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { perdida, loading, error } = usePerdida(parseInt(id));
  const [totalRecuperado, setTotalRecuperado] = useState(0);

  useEffect(() => {
    if (perdida && perdida.recuperaciones) {
      const total = perdida.recuperaciones.reduce(
        (acc, rec) => acc + Number(rec.monto),
        0
      );
      setTotalRecuperado(total);
    }
  }, [perdida]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando información de la pérdida...</Typography>
      </Box>
    );
  }

  if (error || !perdida) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error || "No se pudo cargar la información de la pérdida"}
        </Typography>
      </Box>
    );
  }

  const montoOriginal = Number(perdida.monto);
  const montoRestante = montoOriginal - totalRecuperado;
  const porcentajeRecuperado = (totalRecuperado / montoOriginal) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Detalle de Pérdida
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Fecha:</strong>{" "}
              {new Date(perdida.fecha).toLocaleDateString("es-AR")}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Descripción:</strong> {perdida.descripcion}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Moneda:</strong> {perdida.moneda}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Monto original:</strong>{" "}
              {perdida.moneda === "Dolar"
                ? `U$D ${Number(perdida.monto).toFixed(2)}`
                : getFormattedPrice(perdida.monto)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Recuperado
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {perdida.moneda === "Dolar"
                      ? `U$D ${totalRecuperado.toFixed(2)}`
                      : getFormattedPrice(totalRecuperado)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {porcentajeRecuperado.toFixed(2)}% del monto original
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#fff8e1", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monto Restante
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {perdida.moneda === "Dolar"
                      ? `U$D ${montoRestante.toFixed(2)}`
                      : getFormattedPrice(montoRestante)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(100 - porcentajeRecuperado).toFixed(2)}% pendiente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#fafafa", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cantidad de Recuperos
                  </Typography>
                  <Typography variant="h5">
                    {perdida.recuperaciones.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registros de recuperación
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default RecuperoPage;
