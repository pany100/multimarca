"use client";

import { useFetch } from "@/contexts/FetchContext";
import GroupIcon from "@mui/icons-material/Group";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Chip, Grid, Tooltip as MuiTooltip } from "@mui/material";
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
import GlobalFilters, { FiltroEstadisticas } from "../GlobalFilters";
import ChartWithDetail, {
  TableColumn,
  formatCurrency,
} from "../ChartWithDetail";
import KPICard from "../KPICard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface KpiExtracciones {
  total: number;
  cantidad: number;
  promedio: number;
  gastosBancarios: number;
  gastosArba: number;
}

interface MesItem {
  label: string;
  total: number;
  cantidad: number;
  porUsuario: Record<string, number>;
}

interface EvolucionData {
  meses: MesItem[];
  usuarios: string[];
}

interface PorUsuarioItem {
  usuario: string;
  total: number;
  cantidad: number;
}

interface DetalleItem {
  id: number;
  fecha: string;
  monto: number;
  montoArs: number;
  moneda: string;
  motivo: string;
  usuario: string | null;
  tipo_operacion: string | null;
  gastos_bancarios: number;
  gastos_arba: number;
  revisado: boolean;
}

interface ExtraccionesData {
  kpis: KpiExtracciones;
  kpisPrev: KpiExtracciones;
  evolucion: EvolucionData;
  porUsuario: PorUsuarioItem[];
  detalle: DetalleItem[];
}

function buildQuery(filtro: FiltroEstadisticas): string {
  const params = new URLSearchParams();
  if (filtro.from) params.set("from", filtro.from);
  if (filtro.to) params.set("to", filtro.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Paleta para el donut por usuario
const USUARIO_COLORS = [
  "rgba(66, 165, 245, 0.8)",
  "rgba(102, 187, 106, 0.8)",
  "rgba(255, 167, 38, 0.8)",
  "rgba(171, 71, 188, 0.8)",
  "rgba(239, 83, 80, 0.8)",
  "rgba(38, 198, 218, 0.8)",
  "rgba(255, 112, 67, 0.8)",
  "rgba(141, 110, 99, 0.8)",
];

const evolucionColumns: TableColumn[] = [
  { key: "label", label: "Mes" },
  {
    key: "total",
    label: "Total extraído",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 700 },
    headerSx: { fontWeight: 800 },
  },
  { key: "cantidad", label: "Cantidad", align: "right" },
];

const usuarioColumns: TableColumn[] = [
  { key: "usuario", label: "Usuario" },
  {
    key: "total",
    label: "Total extraído",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 600 },
    headerSx: { fontWeight: 800 },
  },
  { key: "cantidad", label: "Cantidad", align: "right" },
  { key: "porcentaje", label: "% del total", align: "right" },
];

const detalleColumns: TableColumn[] = [
  {
    key: "fecha",
    label: "Fecha",
    format: (v: string) => (v ? new Date(v).toLocaleDateString("es-AR") : "-"),
  },
  { key: "usuario", label: "Usuario" },
  {
    key: "montoArs",
    label: "Monto",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 700 },
    headerSx: { fontWeight: 800 },
  },
];

export default function Extracciones() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<ExtraccionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstadisticas>({ from: null, to: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery(filtro);
      const res = await authFetch(`/api/estadisticas/v2/extracciones${qs}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch, filtro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = data?.kpis;
  const kpisPrev = data?.kpisPrev;
  const gastosAsociados = kpis ? kpis.gastosBancarios + kpis.gastosArba : 0;
  const gastosAsociadosPrev = kpisPrev
    ? kpisPrev.gastosBancarios + kpisPrev.gastosArba
    : 0;

  // Evolución mensual (barras apiladas por usuario)
  const evMeses = data?.evolucion.meses ?? [];
  const evUsuarios = data?.evolucion.usuarios ?? [];
  const evolucionChartData = {
    labels: evMeses.map((m) => m.label),
    datasets: evUsuarios.map((usuario, i) => ({
      label: usuario,
      data: evMeses.map((m) => m.porUsuario[usuario] ?? 0),
      backgroundColor: USUARIO_COLORS[i % USUARIO_COLORS.length],
      borderColor: "rgba(255,255,255,0.6)",
      borderWidth: 1,
      stack: "extracciones",
    })),
  };
  const evolucionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${formatCurrency(ctx.parsed?.y ?? 0)}`,
          footer: (items: any[]) => {
            const mes = evMeses[items[0]?.dataIndex];
            if (!mes) return "";
            return `Total: ${formatCurrency(mes.total)} · ${mes.cantidad} extracción(es)`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value: any) =>
            new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              notation: "compact" as const,
              compactDisplay: "short" as const,
            }).format(value),
        },
      },
    },
  };

  // Donut por usuario
  const porUsuario = data?.porUsuario ?? [];
  const usuarioTotal = porUsuario.reduce((acc, u) => acc + u.total, 0);
  const usuarioChartData = {
    labels: porUsuario.map((u) => u.usuario),
    datasets: [
      {
        data: porUsuario.map((u) => u.total),
        backgroundColor: porUsuario.map(
          (_, i) => USUARIO_COLORS[i % USUARIO_COLORS.length]
        ),
        borderColor: "rgba(255,255,255,0.8)",
        borderWidth: 1,
      },
    ],
  };
  const usuarioOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct =
              usuarioTotal > 0 ? ((val / usuarioTotal) * 100).toFixed(1) : "0";
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };
  const usuarioRows = porUsuario.map((u) => ({
    usuario: u.usuario,
    total: u.total,
    cantidad: u.cantidad,
    porcentaje:
      usuarioTotal > 0
        ? ((u.total / usuarioTotal) * 100).toFixed(1) + "%"
        : "0%",
  }));

  return (
    <Box>
      <GlobalFilters onApply={setFiltro} showPeriodPresets />

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Total extraído"
            value={kpis?.total ?? null}
            previousValue={kpisPrev?.total}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Cantidad de extracciones"
            value={kpis?.cantidad ?? null}
            previousValue={kpisPrev?.cantidad}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Promedio por extracción"
            value={kpis?.promedio ?? null}
            previousValue={kpisPrev?.promedio}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Gastos asociados"
            value={kpis ? gastosAsociados : null}
            previousValue={kpisPrev ? gastosAsociadosPrev : undefined}
            subtitle="Bancarios + ARBA"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Desglose por usuario */}
      <ChartWithDetail
        title="Extracciones por usuario"
        icon={<GroupIcon color="primary" />}
        loading={loading}
        columns={usuarioColumns}
        rows={usuarioRows}
        emptyMessage="Sin extracciones en el período"
        chart={
          <Box sx={{ height: 300, display: "flex", justifyContent: "center" }}>
            <Box sx={{ maxWidth: 500, width: "100%" }}>
              <Doughnut data={usuarioChartData} options={usuarioOptions as any} />
            </Box>
          </Box>
        }
      />

      {/* Evolución mensual */}
      <Box sx={{ mt: 3 }}>
        <ChartWithDetail
          title="Evolución mensual por usuario"
          icon={
            <MuiTooltip
              arrow
              placement="top"
              title="Total extraído mes a mes durante los 6 meses previos a la fecha 'Hasta' del filtro (incluyéndola). No depende de la fecha 'Desde'. Cada barra se divide por usuario; el tooltip de cada mes muestra el total y la cantidad de extracciones."
            >
              <Box component="span" sx={{ display: "inline-flex", cursor: "help" }}>
                <TrendingUpIcon color="primary" />
                <InfoOutlinedIcon
                  fontSize="small"
                  color="action"
                  sx={{ ml: 0.25 }}
                />
              </Box>
            </MuiTooltip>
          }
          loading={loading}
          columns={evolucionColumns}
          rows={evMeses}
          chart={
            <Box sx={{ height: 350 }}>
              <Bar data={evolucionChartData} options={evolucionOptions as any} />
            </Box>
          }
        />
      </Box>

      {/* Detalle de extracciones */}
      <Box sx={{ mt: 3 }}>
        <ChartWithDetail
          title="Detalle de extracciones"
          icon={<PaymentsIcon color="primary" />}
          loading={loading}
          columns={detalleColumns}
          rows={data?.detalle ?? []}
          emptyMessage="Sin extracciones en el período"
          chart={
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`${data?.detalle.length ?? 0} extracciones en el período`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Total: ${formatCurrency(kpis?.total ?? 0)}`}
                color="error"
                variant="outlined"
              />
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
