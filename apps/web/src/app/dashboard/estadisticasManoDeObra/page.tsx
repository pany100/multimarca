"use client";

import ChartWithDetail, {
  TableColumn,
  formatCurrency,
} from "@/components/estadisticas-v2/ChartWithDetail";
import GlobalFilters, {
  FiltroEstadisticas,
} from "@/components/estadisticas-v2/GlobalFilters";
import KPICard from "@/components/estadisticas-v2/KPICard";
import { useFetch } from "@/contexts/FetchContext";
import BuildIcon from "@mui/icons-material/Build";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Box, Grid, Typography } from "@mui/material";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ManoDeObraData {
  kpis: {
    totalMdO: number;
    promedioOrden: number;
    cantidadOrdenes: number;
    trabajoMasFrecuente: string | null;
  };
  kpisPrev: {
    totalMdO: number;
    promedioOrden: number;
    cantidadOrdenes: number;
  };
  topPorMonto: {
    descripcion: string;
    total: number;
    cantidadOrdenes: number;
  }[];
  topPorFrecuencia: {
    descripcion: string;
    total: number;
    cantidadOrdenes: number;
  }[];
  evolucion: { label: string; total: number; ordenes: number }[];
}

const currencyOpts = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

export default function EstadisticasManoDeObra() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<ManoDeObraData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtro?.from) params.set("from", filtro.from);
        if (filtro?.to) params.set("to", filtro.to);
        const qs = params.toString();
        const res = await authFetch(
          `/api/estadisticas/v2/mano-de-obra${qs ? `?${qs}` : ""}`
        );
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

  const kpis = data?.kpis;
  const kpisPrev = data?.kpisPrev;

  // ── Evolución mensual ────────────────────────────────────────────────
  const evoChartData = {
    labels: data?.evolucion.map((e) => e.label) ?? [],
    datasets: [
      {
        label: "Mano de obra",
        data: data?.evolucion.map((e) => e.total) ?? [],
        backgroundColor: "rgba(66, 165, 245, 0.7)",
        borderColor: "rgba(66, 165, 245, 1)",
        borderWidth: 1,
      },
    ],
  };
  const evoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatCurrency(ctx.parsed?.y ?? 0),
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
  const evoColumns: TableColumn[] = [
    { key: "label", label: "Mes" },
    { key: "total", label: "Total MdO", align: "right", format: formatCurrency },
    { key: "ordenes", label: "Órdenes", align: "right" },
  ];

  // ── Top por monto ────────────────────────────────────────────────────
  const montoChartData = {
    labels: data?.topPorMonto.map((t) => t.descripcion) ?? [],
    datasets: [
      {
        label: "Total",
        data: data?.topPorMonto.map((t) => t.total) ?? [],
        backgroundColor:
          data?.topPorMonto.map(
            (_, i) => `hsla(${(i * 37) % 360}, 65%, 55%, 0.7)`
          ) ?? [],
        borderWidth: 1,
      },
    ],
  };
  const montoOptions = {
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
  const montoColumns: TableColumn[] = [
    { key: "descripcion", label: "Trabajo" },
    { key: "total", label: "Total MdO", align: "right", format: formatCurrency },
    { key: "cantidadOrdenes", label: "Órdenes", align: "right" },
  ];

  // ── Top por frecuencia ───────────────────────────────────────────────
  const freqChartData = {
    labels: data?.topPorFrecuencia.map((t) => t.descripcion) ?? [],
    datasets: [
      {
        label: "Órdenes",
        data: data?.topPorFrecuencia.map((t) => t.cantidadOrdenes) ?? [],
        backgroundColor: "rgba(102, 187, 106, 0.7)",
        borderColor: "rgba(102, 187, 106, 1)",
        borderWidth: 1,
      },
    ],
  };
  const freqOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.parsed?.x ?? 0} órdenes`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };
  const freqColumns: TableColumn[] = [
    { key: "descripcion", label: "Trabajo" },
    { key: "cantidadOrdenes", label: "Órdenes", align: "right" },
    { key: "total", label: "Total MdO", align: "right", format: formatCurrency },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Estadísticas de Mano de Obra
      </Typography>

      <GlobalFilters onApply={(f) => fetchData(f)} />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Total mano de obra"
            value={kpis?.totalMdO ?? null}
            previousValue={kpisPrev?.totalMdO}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Promedio por orden"
            value={kpis?.promedioOrden ?? null}
            previousValue={kpisPrev?.promedioOrden}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Órdenes atendidas"
            value={kpis?.cantidadOrdenes ?? null}
            previousValue={kpisPrev?.cantidadOrdenes}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Trabajo más frecuente"
            value={null}
            loading={loading}
            subtitle={kpis?.trabajoMasFrecuente ?? "-"}
          />
        </Grid>
      </Grid>

      {/* Evolución mensual */}
      <Box sx={{ mb: 3 }}>
        <ChartWithDetail
          title="Evolución mensual (últimos 6 meses)"
          icon={<TimelineIcon color="primary" />}
          loading={loading}
          columns={evoColumns}
          rows={data?.evolucion ?? []}
          chart={
            <Box sx={{ height: 300 }}>
              <Bar data={evoChartData} options={evoOptions as any} />
            </Box>
          }
        />
      </Box>

      {/* Top por monto + Top por frecuencia */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top 10 — por monto"
            icon={<BuildIcon color="primary" />}
            loading={loading}
            columns={montoColumns}
            rows={data?.topPorMonto ?? []}
            chart={
              <Box
                sx={{
                  height: Math.max(
                    200,
                    (data?.topPorMonto.length ?? 5) * 40
                  ),
                }}
              >
                <Bar data={montoChartData} options={montoOptions as any} />
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top 10 — por frecuencia"
            icon={<FormatListNumberedIcon color="primary" />}
            loading={loading}
            columns={freqColumns}
            rows={data?.topPorFrecuencia ?? []}
            chart={
              <Box
                sx={{
                  height: Math.max(
                    200,
                    (data?.topPorFrecuencia.length ?? 5) * 40
                  ),
                }}
              >
                <Bar data={freqChartData} options={freqOptions as any} />
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}
