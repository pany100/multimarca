"use client";

import { useFetch } from "@/contexts/FetchContext";
import GlobalFilters, {
  FiltroEstadisticas,
} from "@/components/estadisticas-v2/GlobalFilters";
import KPICard from "@/components/estadisticas-v2/KPICard";
import ChartWithDetail, {
  TableColumn,
  formatCurrency,
} from "@/components/estadisticas-v2/ChartWithDetail";
import BarChartIcon from "@mui/icons-material/BarChart";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Tooltip,
  Typography,
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
import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const TOP_CHART = 10;

interface RankingRow {
  nombre: string;
  marca?: string | null;
  proveedor?: string | null;
  unidades: number;
  facturacion: number;
  costo: number;
  gananciaPorMargen: number;
  gananciaPorIva: number;
  gananciaTotal: number;
}

interface RankingKpis {
  unidadesVendidas: number;
  facturacionTotal: number;
  costoTotal: number;
  gananciaPorMargen: number;
  gananciaPorIva: number;
  gananciaTotal: number;
  cantidadProductosDistintos: number;
}

interface RankingResult {
  kpis: RankingKpis;
  topPorUnidades: RankingRow[];
  topPorFacturacion: RankingRow[];
  topPorGanancia: RankingRow[];
}

interface ApiResponse {
  from: string;
  to: string;
  taller: RankingResult;
  terceros: RankingResult;
}

const currencyCompact = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function buildBarData(
  rows: RankingRow[],
  field: "unidades" | "facturacion" | "gananciaTotal",
  label: string,
  hueBase: number
) {
  const top = rows.slice(0, TOP_CHART);
  return {
    labels: top.map((r) => truncate(r.nombre, 30)),
    datasets: [
      {
        label,
        data: top.map((r) => Number(r[field]) || 0),
        backgroundColor: top.map(
          (_, i) => `hsla(${hueBase + i * 18}, 60%, 55%, 0.75)`
        ),
        borderWidth: 1,
      },
    ],
  };
}

const currencyBarOpts = {
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
          new Intl.NumberFormat("es-AR", currencyCompact).format(Number(v)),
      },
    },
  },
};

const unitsBarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) =>
          `${Number(ctx.parsed?.x ?? 0).toFixed(2)} unidades`,
      },
    },
  },
  scales: { x: { beginAtZero: true } },
};

const tallerColumnsCommon: TableColumn[] = [
  { key: "nombre", label: "Producto" },
  { key: "marca", label: "Marca", format: (v) => (v ? String(v) : "-") },
];

const tercerosColumnsCommon: TableColumn[] = [
  { key: "nombre", label: "Repuesto / reparación" },
  {
    key: "proveedor",
    label: "Proveedor",
    format: (v) => (v ? String(v) : "-"),
  },
];

function metricColumns(
  primary: "unidades" | "facturacion" | "gananciaTotal"
): TableColumn[] {
  const cols: TableColumn[] = [
    {
      key: "unidades",
      label: "Unidades",
      align: "right",
      format: (v: number) => Number(v).toFixed(2),
    },
    {
      key: "facturacion",
      label: "Facturación",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "gananciaPorMargen",
      label: "Gan. margen",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "gananciaPorIva",
      label: "Gan. IVA",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "gananciaTotal",
      label: "Gan. total",
      align: "right",
      format: formatCurrency,
    },
  ];
  // bring primary metric first for visual emphasis
  return cols.sort((a, b) =>
    a.key === primary ? -1 : b.key === primary ? 1 : 0
  );
}

interface SeccionProps {
  titulo: string;
  data: RankingResult | null;
  loading: boolean;
  origen: "taller" | "terceros";
  hueBase: number;
}

function Seccion({ titulo, data, loading, origen, hueBase }: SeccionProps) {
  const baseCols =
    origen === "taller" ? tallerColumnsCommon : tercerosColumnsCommon;

  const buildCols = (
    primary: "unidades" | "facturacion" | "gananciaTotal"
  ): TableColumn[] => [...baseCols, ...metricColumns(primary)];

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        {origen === "taller" ? (
          <InventoryIcon color="primary" />
        ) : (
          <LocalShippingIcon color="primary" />
        )}
        {titulo}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Unidades vendidas"
            value={data?.kpis.unidadesVendidas ?? null}
            format="number"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Facturación total"
            value={data?.kpis.facturacionTotal ?? null}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard
            label="Ganancia por margen"
            value={data?.kpis.gananciaPorMargen ?? null}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Tooltip
            title="Diferencia entre el IVA cobrado al cliente y el IVA pagado al proveedor por estos productos."
            arrow
            placement="top"
          >
            <Box>
              <KPICard
                label="Ganancia por IVA"
                value={data?.kpis.gananciaPorIva ?? null}
                loading={loading}
                subtitle={
                  data
                    ? `Total: ${formatCurrency(data.kpis.gananciaTotal)}`
                    : undefined
                }
              />
            </Box>
          </Tooltip>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top vendidos por unidades"
            icon={<BarChartIcon color="primary" />}
            loading={loading}
            columns={buildCols("unidades")}
            rows={data?.topPorUnidades ?? []}
            chart={
              <Box
                sx={{
                  height: Math.max(
                    250,
                    Math.min(
                      data?.topPorUnidades.length ?? 5,
                      TOP_CHART
                    ) * 40
                  ),
                }}
              >
                <Bar
                  data={buildBarData(
                    data?.topPorUnidades ?? [],
                    "unidades",
                    "Unidades",
                    hueBase
                  )}
                  options={unitsBarOpts as any}
                />
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Top vendidos por facturación"
            icon={<MonetizationOnIcon color="primary" />}
            loading={loading}
            columns={buildCols("facturacion")}
            rows={data?.topPorFacturacion ?? []}
            chart={
              <Box
                sx={{
                  height: Math.max(
                    250,
                    Math.min(
                      data?.topPorFacturacion.length ?? 5,
                      TOP_CHART
                    ) * 40
                  ),
                }}
              >
                <Bar
                  data={buildBarData(
                    data?.topPorFacturacion ?? [],
                    "facturacion",
                    "Facturación",
                    hueBase + 40
                  )}
                  options={currencyBarOpts as any}
                />
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12}>
          <ChartWithDetail
            title="Top vendidos por ganancia (margen + IVA)"
            icon={<TrendingUpIcon color="primary" />}
            loading={loading}
            columns={buildCols("gananciaTotal")}
            rows={data?.topPorGanancia ?? []}
            chart={
              <Box
                sx={{
                  height: Math.max(
                    250,
                    Math.min(
                      data?.topPorGanancia.length ?? 5,
                      TOP_CHART
                    ) * 40
                  ),
                }}
              >
                <Bar
                  data={buildBarData(
                    data?.topPorGanancia ?? [],
                    "gananciaTotal",
                    "Ganancia total",
                    hueBase + 80
                  )}
                  options={currencyBarOpts as any}
                />
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default function EstadisticasRepuestos() {
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtro?.from) params.set("from", filtro.from);
        if (filtro?.to) params.set("to", filtro.to);
        const qs = params.toString();
        const res = await authFetch(
          `/api/estadisticas/v2/repuestos-ranking${qs ? `?${qs}` : ""}`
        );
        if (res.ok) setResponse(await res.json());
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box>
      <GlobalFilters showPeriodPresets onApply={(f) => fetchData(f)} />

      {loading && !response ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={300}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Seccion
            titulo="Repuestos de taller"
            data={response?.taller ?? null}
            loading={loading}
            origen="taller"
            hueBase={200}
          />
          <Divider sx={{ my: 4 }} />
          <Seccion
            titulo="Repuestos / reparaciones de terceros"
            data={response?.terceros ?? null}
            loading={loading}
            origen="terceros"
            hueBase={20}
          />
        </>
      )}
    </Box>
  );
}
