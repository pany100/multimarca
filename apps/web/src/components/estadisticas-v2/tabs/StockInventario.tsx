"use client";

import { useFetch } from "@/contexts/FetchContext";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
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
  useTheme,
} from "@mui/material";
import Link from "next/link";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartWithDetail, { TableColumn, formatCurrency } from "../ChartWithDetail";
import KPICard from "../KPICard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StockData {
  kpis: { valorCosto: number; valorVenta: number; gananciaPotencial: number; alertasReposicion: number };
  rentables: { nombre: string; marca: string; unidadesVendidas: number; ganancia: number }[];
  vendidos: { nombre: string; marca: string; unidadesVendidas: number }[];
  alertas: { nombre: string; marca: string; stockActual: number; stockMinimo: number; proveedor: string | null; ultimoPrecioCompra: number }[];
}

const currencyOpts = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

export default function StockInventario() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/estadisticas/v2/stock-inventario");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rentableColumns: TableColumn[] = [
    { key: "nombre", label: "Producto" },
    { key: "marca", label: "Marca" },
    { key: "unidadesVendidas", label: "Uds. vendidas", align: "right", format: (v: number) => Number(v).toFixed(1) },
    { key: "ganancia", label: "Ganancia", align: "right", format: formatCurrency },
  ];

  const vendidoColumns: TableColumn[] = [
    { key: "nombre", label: "Producto" },
    { key: "marca", label: "Marca" },
    { key: "unidadesVendidas", label: "Uds. vendidas", align: "right", format: (v: number) => Number(v).toFixed(1) },
  ];

  // Top rentables - horizontal bar
  const rentableChart = {
    labels: data?.rentables.map(r => r.nombre.length > 30 ? r.nombre.slice(0, 30) + "..." : r.nombre) ?? [],
    datasets: [{
      label: "Ganancia",
      data: data?.rentables.map(r => r.ganancia) ?? [],
      backgroundColor: data?.rentables.map((_, i) => `hsla(${120 + i * 25}, 60%, 50%, 0.7)`) ?? [],
      borderWidth: 1,
    }],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => formatCurrency(ctx.parsed?.x ?? 0) } },
    },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v: any) => new Intl.NumberFormat("es-AR", currencyOpts).format(v) } },
    },
  };

  // Top vendidos - horizontal bar
  const vendidoChart = {
    labels: data?.vendidos.map(r => r.nombre.length > 30 ? r.nombre.slice(0, 30) + "..." : r.nombre) ?? [],
    datasets: [{
      label: "Unidades",
      data: data?.vendidos.map(r => r.unidadesVendidas) ?? [],
      backgroundColor: data?.vendidos.map((_, i) => `hsla(${200 + i * 20}, 60%, 55%, 0.7)`) ?? [],
      borderWidth: 1,
    }],
  };
  const vendidoOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${Number(ctx.parsed?.x ?? 0).toFixed(1)} unidades` } },
    },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AutorenewIcon />}
          component={Link}
          href="/dashboard/estadisticas-v2/rotacion-stock"
        >
          Ver rotación de stock
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard label="Valor stock (costo)" value={data?.kpis.valorCosto ?? null} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Valor stock (venta)" value={data?.kpis.valorVenta ?? null} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Ganancia potencial" value={data?.kpis.gananciaPotencial ?? null} loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Alertas reposición" value={data?.kpis.alertasReposicion ?? null} format="number" loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top 10 productos más rentables (mes actual)"
            icon={<TrendingUpIcon color="primary" />}
            loading={loading}
            columns={rentableColumns}
            rows={data?.rentables ?? []}
            chart={<Box sx={{ height: Math.max(250, (data?.rentables.length ?? 5) * 40) }}><Bar data={rentableChart} options={barOpts as any} /></Box>}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top 10 productos más vendidos (mes actual)"
            icon={<InventoryIcon color="primary" />}
            loading={loading}
            columns={vendidoColumns}
            rows={data?.vendidos ?? []}
            chart={<Box sx={{ height: Math.max(250, (data?.vendidos.length ?? 5) * 40) }}><Bar data={vendidoChart} options={vendidoOpts as any} /></Box>}
          />
        </Grid>
      </Grid>

      {/* Alertas de reposición */}
      <Paper elevation={0} sx={{ mt: 3, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Alertas de reposición
        </Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Marca</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Stock actual</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Mínimo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Último precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
              ) : (data?.alertas ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">Sin alertas de reposición</TableCell></TableRow>
              ) : (
                (data?.alertas ?? []).map((a, i) => (
                  <TableRow key={i} hover sx={{ backgroundColor: a.stockActual === 0 ? "error.50" : undefined }}>
                    <TableCell>{a.nombre}</TableCell>
                    <TableCell>{a.marca}</TableCell>
                    <TableCell align="right" sx={{ color: a.stockActual === 0 ? "error.main" : "warning.main", fontWeight: 600 }}>{a.stockActual}</TableCell>
                    <TableCell align="right">{a.stockMinimo}</TableCell>
                    <TableCell>{a.proveedor ?? "-"}</TableCell>
                    <TableCell align="right">{formatCurrency(a.ultimoPrecioCompra)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
