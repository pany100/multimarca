"use client";

import { useFetch } from "@/contexts/FetchContext";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import KPICard from "../KPICard";
import useExportarRotacionStock from "@/hooks/useExportarRotacionStock";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface ProductoRotacion {
  stockId: number;
  nombre: string;
  marca: string;
  proveedor: string | null;
  sector: string | null;
  stockActual: number;
  unidadesVendidas365: number;
  diasPromedioStock: number | null;
  fechaUltimoMovimiento: string | null;
  diasDesdeUltimoMovimiento: number | null;
}

interface RotacionData {
  kpis: {
    totalProductosConStock: number;
    productosSinMov90: number;
    productosSinMov180: number;
    productosSinMov365: number;
    diasPromedioStockGlobal: number;
  };
  productos: ProductoRotacion[];
}

type Bucket = "todos" | "90" | "180" | "365";

function formatDias(dias: number | null): string {
  if (dias == null) return "Sin movimiento";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "1 día";
  return `${dias} días`;
}

function colorPorDiasPromedio(dias: number | null): { color: string; label: string } | null {
  if (dias == null) return null;
  if (dias < 180) return { color: "success.main", label: "Saludable" };
  if (dias <= 365) return { color: "warning.main", label: "Lento" };
  return { color: "error.main", label: "Muerto" };
}

function colorPorInactividad(dias: number | null): string {
  if (dias == null || dias >= 365) return "error.main";
  if (dias >= 180) return "warning.main";
  if (dias >= 90) return "warning.dark";
  return "text.primary";
}

export default function RotacionStock() {
  const { authFetch } = useFetch();
  const theme = useTheme();
  const [data, setData] = useState<RotacionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState<Bucket>("todos");
  const { exportarPdf, isLoading: isExporting } = useExportarRotacionStock();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/estadisticas/v2/rotacion-stock");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const counts = useMemo(() => {
    const productos = data?.productos ?? [];
    return {
      todos: productos.length,
      "90": productos.filter((p) => (p.diasDesdeUltimoMovimiento ?? Infinity) >= 90).length,
      "180": productos.filter((p) => (p.diasDesdeUltimoMovimiento ?? Infinity) >= 180).length,
      "365": productos.filter((p) => (p.diasDesdeUltimoMovimiento ?? Infinity) >= 365).length,
    };
  }, [data]);

  const productosFiltrados = useMemo(() => {
    if (!data) return [];
    if (bucket === "todos") return data.productos;
    const min = Number(bucket);
    return data.productos.filter((p) => {
      const dias = p.diasDesdeUltimoMovimiento ?? Infinity;
      return dias >= min;
    });
  }, [data, bucket]);

  const chartData = useMemo(() => {
    const k = data?.kpis;
    return {
      labels: [
        "Productos con stock",
        "Sin venderse hace 3+ meses",
        "Sin venderse hace 6+ meses",
        "Sin venderse hace 1+ año",
      ],
      datasets: [
        {
          label: "Productos",
          data: [
            k?.totalProductosConStock ?? 0,
            k?.productosSinMov90 ?? 0,
            k?.productosSinMov180 ?? 0,
            k?.productosSinMov365 ?? 0,
          ],
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.warning.dark,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, theme]);

  const chartOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} productos`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    }),
    [],
  );

  const handleExport = () => {
    if (!data) return;
    exportarPdf(data);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Rotación de stock
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Cuántos días tarda en venderse cada repuesto al ritmo del último año, y qué
            productos llevan mucho tiempo sin moverse.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cuanto más alto el número de días, más lento rota.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExport}
          disabled={loading || isExporting || !data}
        >
          {isExporting ? "Generando PDF..." : "Exportar PDF"}
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Días promedio para vender"
            value={data?.kpis.diasPromedioStockGlobal ?? null}
            format="number"
            loading={loading}
            subtitle="Tiempo promedio que tarda un repuesto en venderse al ritmo del último año"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Sin venderse hace 3+ meses"
            value={data?.kpis.productosSinMov90 ?? null}
            format="number"
            loading={loading}
            subtitle="Productos sin entrada ni salida hace ≥ 90 días"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Sin venderse hace 6+ meses"
            value={data?.kpis.productosSinMov180 ?? null}
            format="number"
            loading={loading}
            subtitle="Productos sin entrada ni salida hace ≥ 180 días"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Sin venderse hace 1+ año"
            value={data?.kpis.productosSinMov365 ?? null}
            format="number"
            loading={loading}
            subtitle="Stock muerto: candidatos a liquidación"
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <HourglassEmptyIcon color="primary" />
          Productos sin venderse, agrupados por antigüedad
        </Typography>
        <Box sx={{ p: 3, height: 320 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <Bar data={chartData} options={chartOpts as any} />
          )}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
            <AutorenewIcon color="primary" />
            Detalle por producto ({productosFiltrados.length})
          </Typography>
          <ToggleButtonGroup
            value={bucket}
            exclusive
            size="small"
            onChange={(_, v) => v && setBucket(v)}
          >
            <ToggleButton value="todos">Todos ({counts.todos})</ToggleButton>
            <ToggleButton value="90">3+ meses ({counts["90"]})</ToggleButton>
            <ToggleButton value="180">6+ meses ({counts["180"]})</ToggleButton>
            <ToggleButton value="365">1+ año ({counts["365"]})</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Marca</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sector</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <Tooltip title="Cantidad actualmente en depósito"><span>Stock actual</span></Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <Tooltip title="Unidades vendidas en los últimos 365 días"><span>Vendidas (último año)</span></Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <Tooltip title="Cuántos días tarda en venderse el stock actual al ritmo del último año"><span>Días para vender</span></Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  <Tooltip title="Tiempo desde la última compra, venta o consumo en orden de reparación"><span>Última actividad</span></Tooltip>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Ver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay productos en este filtro
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((p) => {
                  const semaforo = colorPorDiasPromedio(p.diasPromedioStock);
                  return (
                    <TableRow key={p.stockId} hover>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.marca || "-"}</TableCell>
                      <TableCell>{p.proveedor ?? "-"}</TableCell>
                      <TableCell>{p.sector ?? "-"}</TableCell>
                      <TableCell align="right">{Number(p.stockActual).toFixed(2)}</TableCell>
                      <TableCell align="right">{Number(p.unidadesVendidas365).toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {p.diasPromedioStock == null ? (
                          <Typography component="span" variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                            <Typography component="span" variant="body2" sx={{ color: semaforo?.color, fontWeight: 600 }}>
                              {p.diasPromedioStock}d
                            </Typography>
                            {semaforo && (
                              <Chip
                                label={semaforo.label}
                                size="small"
                                sx={{
                                  bgcolor: semaforo.color,
                                  color: "white",
                                  fontSize: 10,
                                  height: 18,
                                }}
                              />
                            )}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: colorPorInactividad(p.diasDesdeUltimoMovimiento), fontWeight: 600 }}
                      >
                        {formatDias(p.diasDesdeUltimoMovimiento)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver en stock">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/dashboard/stock/${p.stockId}`}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
