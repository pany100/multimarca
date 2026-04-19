"use client";

import ChartWithDetail, {
  formatCurrency,
  TableColumn,
} from "@/components/estadisticas-v2/ChartWithDetail";
import GlobalFilters, {
  FiltroEstadisticas,
} from "@/components/estadisticas-v2/GlobalFilters";
import KPICard from "@/components/estadisticas-v2/KPICard";
import { useFetch } from "@/contexts/FetchContext";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
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
  Filler,
  Title,
  Tooltip,
  Legend
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Kpis {
  totalComprado: number;
  ordenesCompra: number;
  reparacionesTercero: number;
  promedioPorProveedor: number;
}

interface ProveedorRow {
  proveedorId: number;
  proveedorNombre: string;
  totalGastado: number;
  cantidadOrdenesCompra: number;
  cantidadReparacionesTerceroOrden: number;
  cantidadReparacionesTerceroVenta: number;
  cantidadTotal: number;
}

interface ComposicionItem {
  label: string;
  total: number;
}

interface EvolucionItem {
  label: string;
  ordenesCompra: number;
  reparacionesTercero: number;
  total: number;
}

interface ProveedoresData {
  kpis: Kpis;
  kpisPrev: Kpis | null;
  topProveedores: ProveedorRow[];
  composicion: ComposicionItem[];
  evolucion: EvolucionItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDefaultFrom(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getDefaultTo(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

const CHART_COLORS = {
  blue: "rgba(66, 165, 245, 1)",
  blueBg: "rgba(66, 165, 245, 0.7)",
  green: "rgba(102, 187, 106, 1)",
  greenBg: "rgba(102, 187, 106, 0.7)",
  red: "rgba(239, 83, 80, 1)",
  redBg: "rgba(239, 83, 80, 0.7)",
  orange: "rgba(255, 167, 38, 1)",
  orangeBg: "rgba(255, 167, 38, 0.8)",
  purple: "rgba(171, 71, 188, 1)",
  purpleBg: "rgba(171, 71, 188, 0.7)",
};

const DOUGHNUT_COLORS = [
  CHART_COLORS.blueBg,
  CHART_COLORS.orangeBg,
  CHART_COLORS.greenBg,
  CHART_COLORS.purpleBg,
  CHART_COLORS.redBg,
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function EstadisticasProveedoresPage() {
  const { authFetch } = useFetch();
  const theme = useTheme();
  const [data, setData] = useState<ProveedoresData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (from?: string | null, to?: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        const res = await authFetch(
          `/api/estadisticas/v2/proveedores?${params.toString()}`
        );
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    const from = getDefaultFrom().toISOString().split("T")[0];
    const to = getDefaultTo().toISOString().split("T")[0];
    fetchData(from, to);
  }, [fetchData]);

  const handleApply = (filtro: FiltroEstadisticas) => {
    fetchData(filtro.from, filtro.to);
  };

  const kpis = data?.kpis;
  const kpisPrev = data?.kpisPrev;
  const topProveedores = data?.topProveedores ?? [];
  const composicion = data?.composicion ?? [];
  const evolucion = data?.evolucion ?? [];

  // ─── Top proveedores chart ──────────────────────────────────────────

  const top10 = topProveedores.slice(0, 10);
  const topChart = top10.length ? (
    <Box sx={{ height: Math.max(250, top10.length * 40) }}>
      <Bar
        data={{
          labels: top10.map((p) => p.proveedorNombre),
          datasets: [
            {
              data: top10.map((p) => p.totalGastado),
              backgroundColor: CHART_COLORS.blueBg,
              borderColor: CHART_COLORS.blue,
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => formatCurrency(ctx.parsed.x ?? 0),
              },
            },
          },
          scales: {
            x: {
              ticks: {
                callback: (v) =>
                  new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    notation: "compact",
                  }).format(v as number),
              },
            },
          },
        }}
      />
    </Box>
  ) : null;

  const topColumns: TableColumn[] = [
    { key: "proveedorNombre", label: "Proveedor" },
    {
      key: "totalGastado",
      label: "Total comprado",
      align: "right",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "porcentaje",
      label: "% del total",
      align: "right",
      render: (_v: unknown, row: Record<string, unknown>) => {
        const total = kpis?.totalComprado ?? 0;
        if (!total) return "-";
        const pct = ((row.totalGastado as number) / total) * 100;
        return `${pct.toFixed(1)}%`;
      },
    },
    { key: "cantidadOrdenesCompra", label: "OC", align: "right" },
    {
      key: "cantidadReparacionesTerceroOrden",
      label: "Rep. tercero (OdR)",
      align: "right",
    },
    {
      key: "cantidadReparacionesTerceroVenta",
      label: "Rep. tercero (Ventas)",
      align: "right",
    },
    { key: "cantidadTotal", label: "Total mov.", align: "right" },
  ];

  const topRows = topProveedores.map((p) => ({
    proveedorNombre: p.proveedorNombre,
    totalGastado: p.totalGastado,
    cantidadOrdenesCompra: p.cantidadOrdenesCompra,
    cantidadReparacionesTerceroOrden: p.cantidadReparacionesTerceroOrden,
    cantidadReparacionesTerceroVenta: p.cantidadReparacionesTerceroVenta,
    cantidadTotal: p.cantidadTotal,
  }));

  // ─── Composición chart ──────────────────────────────────────────────

  const composicionChart = composicion.length ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: 280,
      }}
    >
      <Doughnut
        data={{
          labels: composicion.map((c) => c.label),
          datasets: [
            {
              data: composicion.map((c) => c.total),
              backgroundColor: DOUGHNUT_COLORS.slice(0, composicion.length),
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = composicion.reduce((s, c) => s + c.total, 0);
                  const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : "0";
                  return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
                },
              },
            },
          },
        }}
      />
    </Box>
  ) : null;

  const composicionColumns: TableColumn[] = [
    { key: "label", label: "Tipo" },
    { key: "total", label: "Monto", align: "right", format: (v: number) => formatCurrency(v) },
    {
      key: "porcentaje",
      label: "%",
      align: "right",
      render: (_v: unknown, row: Record<string, unknown>) => {
        const total = composicion.reduce((s, c) => s + c.total, 0);
        if (!total) return "-";
        return `${(((row.total as number) / total) * 100).toFixed(1)}%`;
      },
    },
  ];

  // ─── Evolución chart ────────────────────────────────────────────────

  const evolucionChart = evolucion.length ? (
    <Box sx={{ height: 300 }}>
      <Bar
        data={{
          labels: evolucion.map((e) => e.label),
          datasets: [
            {
              label: "Órdenes de compra",
              data: evolucion.map((e) => e.ordenesCompra),
              backgroundColor: CHART_COLORS.blueBg,
              borderColor: CHART_COLORS.blue,
              borderWidth: 1,
            },
            {
              label: "Rep. tercero",
              data: evolucion.map((e) => e.reparacionesTercero),
              backgroundColor: CHART_COLORS.orangeBg,
              borderColor: CHART_COLORS.orange,
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            x: { stacked: true },
            y: {
              stacked: true,
              ticks: {
                callback: (v) =>
                  new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    notation: "compact",
                  }).format(v as number),
              },
            },
          },
        }}
      />
    </Box>
  ) : null;

  const evolucionColumns: TableColumn[] = [
    { key: "label", label: "Mes" },
    {
      key: "ordenesCompra",
      label: "Órdenes de compra",
      align: "right",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "reparacionesTercero",
      label: "Rep. tercero",
      align: "right",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (v: number) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatCurrency(v)}
        </Typography>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        Estadísticas de Proveedores
      </Typography>

      <GlobalFilters
        onApply={handleApply}
        defaultFrom={getDefaultFrom()}
        defaultTo={getDefaultTo()}
      />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Total comprado"
            value={kpis?.totalComprado ?? null}
            previousValue={kpisPrev?.totalComprado}
            format="currency"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Órdenes de compra"
            value={kpis?.ordenesCompra ?? null}
            previousValue={kpisPrev?.ordenesCompra}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Reparaciones terceros"
            value={kpis?.reparacionesTercero ?? null}
            previousValue={kpisPrev?.reparacionesTercero}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Promedio por proveedor"
            value={kpis?.promedioPorProveedor ?? null}
            previousValue={kpisPrev?.promedioPorProveedor}
            format="currency"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Top proveedores + Composición */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <ChartWithDetail
            title="Top proveedores por monto"
            icon={
              <LocalShippingIcon
                sx={{ color: theme.palette.primary.main }}
              />
            }
            chart={topChart}
            columns={topColumns}
            rows={topRows}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartWithDetail
            title="Composición del gasto"
            icon={
              <PieChartIcon
                sx={{ color: theme.palette.warning.main }}
              />
            }
            chart={composicionChart}
            columns={composicionColumns}
            rows={composicion}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Evolución */}
      <ChartWithDetail
        title="Evolución mensual (6 meses)"
        icon={
          <TrendingUpIcon
            sx={{ color: theme.palette.success.main }}
          />
        }
        chart={evolucionChart}
        columns={evolucionColumns}
        rows={evolucion}
        loading={loading}
      />
    </Box>
  );
}
