"use client";

import { useFetch } from "@/contexts/FetchContext";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CategoryIcon from "@mui/icons-material/Category";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Grid } from "@mui/material";
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

interface GastosData {
  kpis: { cobrado: number; gastos: number; balance: number };
  kpisPrev: { cobrado: number; gastos: number; balance: number };
  categorias: { nombre: string; total: number }[];
  tiposOperacion: { label: string; total: number; es_ingreso: boolean }[];
  evolucion: { label: string; cobrado: number; gastos: number; balance: number }[];
}

const currencyOpts = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

export default function GastosBalance() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<GastosData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/estadisticas/v2/gastos-balance");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const catColumns: TableColumn[] = [
    { key: "nombre", label: "Categoría" },
    { key: "total", label: "Monto", align: "right", format: formatCurrency },
  ];

  const tipoColumns: TableColumn[] = [
    { key: "label", label: "Tipo de operación" },
    { key: "total", label: "Monto", align: "right", format: formatCurrency },
  ];

  // Gastos por categoría - horizontal bar
  const catChartData = {
    labels: data?.categorias.map(c => c.nombre) ?? [],
    datasets: [{
      label: "Monto",
      data: data?.categorias.map(c => c.total) ?? [],
      backgroundColor: data?.categorias.map((_, i) => `hsla(${(i * 37) % 360}, 65%, 55%, 0.7)`) ?? [],
      borderWidth: 1,
    }],
  };
  const catOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => formatCurrency(ctx.parsed?.x ?? 0) } },
    },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v: any) => new Intl.NumberFormat("es-AR", currencyOpts).format(v) } },
    },
  };

  // Tipos de operación - horizontal bar
  const tipoChartData = {
    labels: data?.tiposOperacion.map(t => t.label) ?? [],
    datasets: [{
      label: "Monto",
      data: data?.tiposOperacion.map(t => t.total) ?? [],
      backgroundColor: data?.tiposOperacion.map(t => t.es_ingreso ? "rgba(102, 187, 106, 0.7)" : "rgba(239, 83, 80, 0.7)") ?? [],
      borderWidth: 1,
    }],
  };
  const tipoOptions = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => formatCurrency(ctx.parsed?.x ?? 0) } },
    },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v: any) => new Intl.NumberFormat("es-AR", currencyOpts).format(v) } },
    },
  };

  // Evolución balance - grouped bar
  const evoChartData = {
    labels: data?.evolucion.map(e => e.label) ?? [],
    datasets: [
      { label: "Cobrado", data: data?.evolucion.map(e => e.cobrado) ?? [], backgroundColor: "rgba(102, 187, 106, 0.7)", borderColor: "rgba(102, 187, 106, 1)", borderWidth: 1 },
      { label: "Gastos", data: data?.evolucion.map(e => e.gastos) ?? [], backgroundColor: "rgba(239, 83, 80, 0.7)", borderColor: "rgba(239, 83, 80, 1)", borderWidth: 1 },
    ],
  };
  const evoOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed?.y ?? 0)}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v: any) => new Intl.NumberFormat("es-AR", currencyOpts).format(v) } },
    },
  };

  const evoColumns: TableColumn[] = [
    { key: "label", label: "Mes" },
    { key: "cobrado", label: "Cobrado", align: "right", format: formatCurrency },
    { key: "gastos", label: "Gastos", align: "right", format: formatCurrency },
    { key: "balance", label: "Balance", align: "right", format: formatCurrency },
  ];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <KPICard label="Ingresos cobrados" value={data?.kpis.cobrado ?? null} previousValue={data?.kpisPrev.cobrado} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard label="Gastos operativos" value={data?.kpis.gastos ?? null} previousValue={data?.kpisPrev.gastos} loading={loading} />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard label="Balance de caja" value={data?.kpis.balance ?? null} previousValue={data?.kpisPrev.balance} loading={loading} />
        </Grid>
      </Grid>

      <ChartWithDetail
        title="Evolución de balance (últimos 6 meses)"
        icon={<AccountBalanceIcon color="primary" />}
        loading={loading}
        columns={evoColumns}
        rows={data?.evolucion ?? []}
        chart={<Box sx={{ height: 350 }}><Bar data={evoChartData} options={evoOptions as any} /></Box>}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Gastos por categoría"
            icon={<CategoryIcon color="primary" />}
            loading={loading}
            columns={catColumns}
            rows={data?.categorias ?? []}
            chart={<Box sx={{ height: Math.max(200, (data?.categorias.length ?? 5) * 40) }}><Bar data={catChartData} options={catOptions as any} /></Box>}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Tipos de operación"
            icon={<SwapHorizIcon color="primary" />}
            loading={loading}
            columns={tipoColumns}
            rows={data?.tiposOperacion ?? []}
            chart={<Box sx={{ height: Math.max(200, (data?.tiposOperacion.length ?? 5) * 40) }}><Bar data={tipoChartData} options={tipoOptions as any} /></Box>}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
