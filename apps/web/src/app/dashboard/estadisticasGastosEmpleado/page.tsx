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
import GroupsIcon from "@mui/icons-material/Groups";
import PaidIcon from "@mui/icons-material/Paid";
import TimelineIcon from "@mui/icons-material/Timeline";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
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
  Tooltip,
} from "chart.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RankingItem {
  empleadoId: number;
  empleadoNombre: string;
  total: number;
  cantidad: number;
}

interface PivotItem {
  empleadoId: number;
  empleadoNombre: string;
  total: number;
  cantidad: number;
  categorias: Record<string, number>;
}

interface GastosPorEmpleadoData {
  kpis: {
    total: number;
    cantidad: number;
    empleados: number;
    promedioPorEmpleado: number;
  };
  kpisPrev: {
    total: number;
    cantidad: number;
    empleados: number;
    promedioPorEmpleado: number;
  };
  ranking: RankingItem[];
  pivot: { categorias: string[]; rows: PivotItem[] };
  evolucion: { label: string; total: number }[];
}

const currencyOpts = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

export default function EstadisticasGastosEmpleadoPage() {
  const theme = useTheme();
  const { authFetch } = useFetch();
  const [data, setData] = useState<GastosPorEmpleadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtro?.from) params.set("from", filtro.from);
        if (filtro?.to) params.set("to", filtro.to);
        const qs = params.toString();
        const res = await authFetch(
          `/api/estadisticas/v2/gastos-por-empleado${qs ? `?${qs}` : ""}`
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

  // ── Ranking chart ────────────────────────────────────────────────────
  const rankingTop = useMemo(
    () => (data?.ranking ?? []).slice(0, 10),
    [data]
  );

  const rankingChartData = {
    labels: rankingTop.map((r) => r.empleadoNombre),
    datasets: [
      {
        label: "Total",
        data: rankingTop.map((r) => r.total),
        backgroundColor: rankingTop.map(
          (_, i) => `hsla(${(i * 37) % 360}, 65%, 55%, 0.7)`
        ),
        borderWidth: 1,
      },
    ],
  };
  const rankingOptions = {
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
  const rankingColumns: TableColumn[] = [
    { key: "empleadoNombre", label: "Empleado" },
    { key: "total", label: "Total", align: "right", format: formatCurrency },
    { key: "cantidad", label: "Gastos", align: "right" },
  ];

  // ── Evolución ────────────────────────────────────────────────────────
  const evoChartData = {
    labels: data?.evolucion.map((e) => e.label) ?? [],
    datasets: [
      {
        label: "Gastos por empleado",
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
    { key: "total", label: "Total", align: "right", format: formatCurrency },
  ];

  // ── Pivot ────────────────────────────────────────────────────────────
  const pivotCategorias = data?.pivot.categorias ?? [];
  const pivotRows = data?.pivot.rows ?? [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Gastos por empleado
      </Typography>

      <GlobalFilters onApply={(f) => fetchData(f)} />

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Total gastos imputados"
            value={kpis?.total ?? null}
            previousValue={kpisPrev?.total}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Empleados involucrados"
            value={kpis?.empleados ?? null}
            previousValue={kpisPrev?.empleados}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Promedio por empleado"
            value={kpis?.promedioPorEmpleado ?? null}
            previousValue={kpisPrev?.promedioPorEmpleado}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Cantidad de gastos"
            value={kpis?.cantidad ?? null}
            previousValue={kpisPrev?.cantidad}
            format="number"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<GroupsIcon />} iconPosition="start" label="Ranking" />
          <Tab
            icon={<ViewModuleIcon />}
            iconPosition="start"
            label="Por categoría"
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <ChartWithDetail
              title="Top empleados por monto"
              icon={<PaidIcon color="primary" />}
              loading={loading}
              columns={rankingColumns}
              rows={data?.ranking ?? []}
              chart={
                <Box
                  sx={{
                    height: Math.max(200, rankingTop.length * 40),
                  }}
                >
                  <Bar
                    data={rankingChartData}
                    options={rankingOptions as any}
                  />
                </Box>
              }
            />
          )}

          {tab === 1 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <ViewModuleIcon color="primary" />
                Empleado × Categoría
              </Typography>
              {pivotRows.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  Sin datos disponibles
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      borderCollapse: "collapse",
                      "& th, & td": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        padding: "8px 12px",
                        fontSize: "0.875rem",
                      },
                      "& th": {
                        textAlign: "left",
                        fontWeight: 600,
                        background: theme.palette.action.hover,
                      },
                      "& td.num, & th.num": { textAlign: "right" },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        {pivotCategorias.map((c) => (
                          <th key={c} className="num">
                            {c}
                          </th>
                        ))}
                        <th className="num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pivotRows.map((row) => (
                        <tr key={row.empleadoId}>
                          <td>{row.empleadoNombre}</td>
                          {pivotCategorias.map((c) => (
                            <td key={c} className="num">
                              {row.categorias[c]
                                ? formatCurrency(row.categorias[c])
                                : "—"}
                            </td>
                          ))}
                          <td className="num">
                            <strong>{formatCurrency(row.total)}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Evolución mensual */}
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
  );
}
