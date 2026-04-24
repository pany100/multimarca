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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const OrdenDeCompraDetallePage = ({ params }: { params: { id: string } }) => {
  const [orden, setOrden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const fetchOrdenDeCompra = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/api/orden-de-compra/${params.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al cargar la orden de compra",
        );
      }

      const data = await response.json();
      setOrden(data);
    } catch (err: any) {
      console.error("Error fetching orden de compra:", err);
      setError(
        err.message || "Ha ocurrido un error al cargar la orden de compra",
      );
    } finally {
      setLoading(false);
    }
  }, [authFetch, params.id]);

  useEffect(() => {
    fetchOrdenDeCompra();
  }, [fetchOrdenDeCompra]);

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
          href="/dashboard/orden-de-compra"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Volver a Órdenes de Compra
        </Button>
      </Box>
    );
  }

  if (!orden) {
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
        <Typography variant="h6">Orden de compra no encontrada</Typography>
        <Button
          component={Link}
          href="/dashboard/orden-de-compra"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Volver a Órdenes de Compra
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

  const hasPrecios = orden.items?.some(
    (item: any) => item.precioUnitario != null,
  );

  const percepcion = Number(orden.percepcion ?? 0);
  const subtotalItemsRaw = hasPrecios
    ? orden.items.reduce((total: number, item: any) => {
        const precio = Number(item.precioUnitario) || 0;
        const iva = Number(item.iva) || 0;
        return total + precio * (1 + iva / 100) * Number(item.cantidad);
      }, 0)
    : Number(orden.precioTotal) - percepcion;
  const precioTotalCalculado =
    Math.round((subtotalItemsRaw + percepcion) * 100) / 100;

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Detalle de Orden de Compra
        </Typography>
        <Button
          component={Link}
          href="/dashboard/orden-de-compra"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Volver a Órdenes de Compra
        </Button>
      </Stack>

      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    ID de Orden
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {orden.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha de Compra
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(orden.fecha)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Proveedor
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {orden.proveedor?.name || "Sin proveedor asignado"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Precio Total
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    {getFormattedPrice(precioTotalCalculado)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Items
          </Typography>

          {orden.items && orden.items.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Producto</TableCell>
                    {hasPrecios && <TableCell>Rótulo</TableCell>}
                    <TableCell align="right">Cantidad</TableCell>
                    {hasPrecios && (
                      <TableCell align="right">Precio Unit.</TableCell>
                    )}
                    {hasPrecios && (
                      <TableCell align="right">IVA %</TableCell>
                    )}
                    {hasPrecios && (
                      <TableCell align="right">Precio c/IVA</TableCell>
                    )}
                    {hasPrecios && (
                      <TableCell align="right">Subtotal</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orden.items.map((item: any) => {
                    const precioUnit = Number(item.precioUnitario) || 0;
                    const ivaPercent = Number(item.iva) || 0;
                    const precioConIva = precioUnit * (1 + ivaPercent / 100);
                    const subtotal = precioConIva * Number(item.cantidad);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name || item.stock?.name}</TableCell>
                        {hasPrecios && (
                          <TableCell>
                            {item.label || item.stock?.label || "—"}
                          </TableCell>
                        )}
                        <TableCell align="right">{item.cantidad}</TableCell>
                        {hasPrecios && (
                          <TableCell align="right">
                            {item.precioUnitario != null
                              ? getFormattedPrice(precioUnit)
                              : "—"}
                          </TableCell>
                        )}
                        {hasPrecios && (
                          <TableCell align="right">
                            {item.iva != null ? `${ivaPercent}%` : "—"}
                          </TableCell>
                        )}
                        {hasPrecios && (
                          <TableCell align="right">
                            {item.precioUnitario != null
                              ? getFormattedPrice(precioConIva)
                              : "—"}
                          </TableCell>
                        )}
                        {hasPrecios && (
                          <TableCell align="right">
                            {item.precioUnitario != null
                              ? getFormattedPrice(subtotal)
                              : "—"}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ py: 2 }}
            >
              No hay items en esta orden de compra
            </Typography>
          )}

          {percepcion > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Percepción:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getFormattedPrice(percepcion)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrdenDeCompraDetallePage;
