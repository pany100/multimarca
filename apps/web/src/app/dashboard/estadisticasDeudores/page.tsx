"use client";

import { useFetch } from "@/contexts/FetchContext";
import ChartWithDetail, {
  TableColumn,
  formatCurrency,
} from "@/components/estadisticas-v2/ChartWithDetail";
import GlobalFilters, {
  FiltroEstadisticas,
} from "@/components/estadisticas-v2/GlobalFilters";
import KPICard from "@/components/estadisticas-v2/KPICard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PieChartIcon from "@mui/icons-material/PieChart";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Box, Grid, Typography } from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useCallback, useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ── types ────────────────────────────────────────────────────────────

interface KpisData {
  deuda_total: number;
  cantidad_deudores: number;
  deuda_promedio: number;
  mayor_deuda: number;
}

interface DeudorRow {
  cliente_id: number;
  cliente_nombre: string;
  cliente_phone: string | null;
  deuda_total: number;
}

interface ComposicionRow {
  origen: string;
  total: number;
}

interface AntiguedadRow {
  rango: string;
  cantidad: number;
  total: number;
}

interface DeudoresData {
  kpis: KpisData;
  kpisPrev: KpisData | null;
  topDeudores: DeudorRow[];
  composicion: ComposicionRow[];
  antiguedad: AntiguedadRow[];
}

// ── chart config ─────────────────────────────────────────────────────

const currencyOpts = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

const PIE_COLORS = [
  "rgba(239, 83, 80, 0.8)",
  "rgba(66, 165, 245, 0.8)",
  "rgba(255, 167, 38, 0.8)",
  "rgba(102, 187, 106, 0.8)",
];

const AGING_COLORS = [
  "rgba(102, 187, 106, 0.8)", // 0-30 green
  "rgba(255, 167, 38, 0.8)", // 30-60 orange
  "rgba(239, 83, 80, 0.8)", // 60-90 red
  "rgba(156, 39, 176, 0.8)", // 90+ purple
];

// ── component ────────────────────────────────────────────────────────

export default function EstadisticasDeudoresPage() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<DeudoresData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const url = new URL(
          "/api/estadisticas/v2/deudores",
          window.location.origin
        );
        if (filtro?.from) url.searchParams.set("from", filtro.from);
        if (filtro?.to) url.searchParams.set("to", filtro.to);
        const res = await authFetch(url.toString());
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Top deudores bar chart ──────────────────────────────────────

  const deudorColumns: TableColumn[] = [
    { key: "cliente_nombre", label: "Cliente" },
    {
      key: "cliente_phone",
      label: "Teléfono",
      render: (v) => v || "-",
    },
    {
      key: "deuda_total",
      label: "Deuda",
      align: "right",
      format: formatCurrency,
    },
  ];

  const deudorChart = {
    labels: data?.topDeudores.map((d) => d.cliente_nombre) ?? [],
    datasets: [
      {
        label: "Deuda",
        data: data?.topDeudores.map((d) => d.deuda_total) ?? [],
        backgroundColor: "rgba(239, 83, 80, 0.7)",
        borderWidth: 1,
      },
    ],
  };

  const deudorOpts = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatCurrency(ctx.parsed?.x ?? 0),
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) =>
            new Intl.NumberFormat("es-AR", currencyOpts).format(v),
        },
      },
    },
  };

  // ── Composición doughnut ────────────────────────────────────────

  const totalComposicion =
    data?.composicion.reduce((acc, c) => acc + c.total, 0) ?? 0;

  const composicionChartData = {
    labels: data?.composicion.map((c) => c.origen) ?? [],
    datasets: [
      {
        data: data?.composicion.map((c) => c.total) ?? [],
        backgroundColor: PIE_COLORS.slice(
          0,
          data?.composicion.length ?? 0
        ),
        borderWidth: 1,
      },
    ],
  };

  const composicionOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct =
              totalComposicion > 0
                ? ((val / totalComposicion) * 100).toFixed(1)
                : "0";
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  const composicionColumns: TableColumn[] = [
    { key: "origen", label: "Origen" },
    { key: "total", label: "Deuda", align: "right", format: formatCurrency },
    {
      key: "porcentaje",
      label: "%",
      align: "right",
      render: (_v, row) =>
        totalComposicion > 0
          ? ((row.total / totalComposicion) * 100).toFixed(1) + "%"
          : "0%",
    },
  ];

  // ── Antigüedad bar chart ────────────────────────────────────────

  const antiguedadChartData = {
    labels: data?.antiguedad.map((a) => a.rango) ?? [],
    datasets: [
      {
        label: "Deuda",
        data: data?.antiguedad.map((a) => a.total) ?? [],
        backgroundColor: AGING_COLORS,
        borderWidth: 1,
      },
    ],
  };

  const antiguedadOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const row = data?.antiguedad[ctx.dataIndex];
            return `${formatCurrency(ctx.parsed?.y ?? 0)} (${row?.cantidad ?? 0} operaciones)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) =>
            new Intl.NumberFormat("es-AR", currencyOpts).format(v),
        },
      },
    },
  };

  const antiguedadColumns: TableColumn[] = [
    { key: "rango", label: "Rango" },
    { key: "cantidad", label: "Operaciones", align: "right" },
    { key: "total", label: "Deuda", align: "right", format: formatCurrency },
  ];

  // ── render ──────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Estadísticas de Deudores
      </Typography>

      <GlobalFilters onApply={fetchData} />

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Deuda total"
            value={data?.kpis.deuda_total ?? null}
            previousValue={data?.kpisPrev?.deuda_total}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Cantidad de deudores"
            value={data?.kpis.cantidad_deudores ?? null}
            previousValue={data?.kpisPrev?.cantidad_deudores}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Deuda promedio"
            value={data?.kpis.deuda_promedio ?? null}
            previousValue={data?.kpisPrev?.deuda_promedio}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Mayor deuda"
            value={data?.kpis.mayor_deuda ?? null}
            previousValue={data?.kpisPrev?.mayor_deuda}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Top deudores */}
      <ChartWithDetail
        title="Top 15 deudores"
        icon={<AccountBalanceWalletIcon color="error" />}
        loading={loading}
        columns={deudorColumns}
        rows={data?.topDeudores ?? []}
        chart={
          <Box
            sx={{
              height: Math.max(
                250,
                (data?.topDeudores.length ?? 5) * 40
              ),
            }}
          >
            <Bar data={deudorChart} options={deudorOpts as any} />
          </Box>
        }
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Composición OdR vs Ventas */}
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Deuda por origen (OdR vs Ventas)"
            icon={<PieChartIcon color="primary" />}
            loading={loading}
            columns={composicionColumns}
            rows={data?.composicion ?? []}
            chart={
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ maxWidth: 450, width: "100%" }}>
                  <Doughnut
                    data={composicionChartData}
                    options={composicionOpts as any}
                  />
                </Box>
              </Box>
            }
          />
        </Grid>

        {/* Antigüedad de deuda */}
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Antigüedad de deuda"
            icon={<ScheduleIcon color="warning" />}
            loading={loading}
            columns={antiguedadColumns}
            rows={data?.antiguedad ?? []}
            chart={
              <Box sx={{ height: 300 }}>
                <Bar
                  data={antiguedadChartData}
                  options={antiguedadOpts as any}
                />
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}
