"use client";

import { useFetch } from "@/contexts/FetchContext";
import BuildIcon from "@mui/icons-material/Build";
import BarChartIcon from "@mui/icons-material/BarChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TableChartIcon from "@mui/icons-material/TableChart";
import GroupIcon from "@mui/icons-material/Group";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js";
import { useCallback, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import GlobalFilters, {
  FiltroEstadisticas,
} from "@/components/estadisticas-v2/GlobalFilters";
import KPICard from "@/components/estadisticas-v2/KPICard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  ChartTooltip,
  Legend
);

/* ── Types ─────────────────────────────────────────── */

interface GananciaSemanal {
  weekStart: string;
  weekEnd: string;
  ganancia: number;
  cantidadOrdenes: number;
}

interface MecanicoGanancias {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: GananciaSemanal[];
  gananciaTotal: number;
  ordenesTotal: number;
  ticketPromedio: number;
}

interface KPIs {
  totalManoDeObra: number;
  ordenesTerminadas: number;
  ticketPromedio: number;
  cantidadMecanicos: number;
}

interface OrdenCompartida {
  ordenId: number;
  fechaSalida: string;
  manoDeObraConIva: number;
  mecanicos: string;
}

interface MecanicosResponse {
  data: MecanicoGanancias[];
  moneda: string;
  kpis: KPIs;
  ordenesCompartidas: OrdenCompartida[];
}

/* ── Helpers ───────────────────────────────────────── */

const CHART_COLORS = [
  { border: "rgba(75, 192, 192, 1)", background: "rgba(75, 192, 192, 0.2)" },
  { border: "rgba(54, 162, 235, 1)", background: "rgba(54, 162, 235, 0.2)" },
  { border: "rgba(153, 102, 255, 1)", background: "rgba(153, 102, 255, 0.2)" },
  { border: "rgba(255, 159, 64, 1)", background: "rgba(255, 159, 64, 0.2)" },
  { border: "rgba(255, 99, 132, 1)", background: "rgba(255, 99, 132, 0.2)" },
  { border: "rgba(255, 206, 86, 1)", background: "rgba(255, 206, 86, 0.2)" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const currencyCompact = {
  style: "currency" as const,
  currency: "ARS",
  notation: "compact" as const,
  compactDisplay: "short" as const,
};

function formatDateShort(dateString: string) {
  const [year, month, day] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

function InfoTooltip({ title }: { title: string }) {
  return (
    <Tooltip title={title} arrow placement="top">
      <InfoOutlinedIcon
        sx={{ fontSize: 16, ml: 0.5, color: "text.secondary", cursor: "help", verticalAlign: "middle" }}
      />
    </Tooltip>
  );
}

/* ── Component ─────────────────────────────────────── */

export default function EstadisticasMecanicos() {
  const theme = useTheme();
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<MecanicosResponse | null>(null);

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ moneda: "ARS" });
        if (filtro?.from) params.set("from", filtro.from);
        if (filtro?.to) params.set("to", filtro.to);
        const res = await authFetch(`/api/estadisticas/mecanicos?${params}`);
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

  const data = response?.data ?? [];
  const kpis = response?.kpis;
  const ordenesCompartidas = response?.ordenesCompartidas ?? [];

  const chartLabels =
    data[0]?.gananciasSemanales.map(
      (w) => `${formatDateShort(w.weekStart)} - ${formatDateShort(w.weekEnd)}`
    ) ?? [];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            let label = ctx.dataset.label || "";
            if (label) label += ": ";
            if (ctx.parsed.y != null) label += formatCurrency(ctx.parsed.y);
            return label;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: theme.palette.divider },
        ticks: {
          callback: (v: any) =>
            new Intl.NumberFormat("es-AR", currencyCompact).format(v),
        },
      },
    },
  };

  /* ── Render ──────────────────────────────────── */

  return (
    <Box>
      {/* Filtros */}
      <GlobalFilters onApply={(f) => fetchData(f)} />

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: "center", my: 4 }}>
          No hay datos disponibles
        </Typography>
      ) : (
        <>
          {/* KPIs */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title="Suma de la mano de obra con IVA de todas las órdenes terminadas en el período. Si una orden tiene más de un mecánico, el monto se atribuye completo a cada uno (ver disclaimer abajo)."
                arrow
                placement="top"
              >
                <Box>
                  <KPICard
                    label="Total mano de obra (c/IVA)"
                    value={kpis?.totalManoDeObra ?? null}
                    loading={loading}
                  />
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title="Cantidad total de órdenes con estado 'Terminado' en el período. Si una orden tiene más de un mecánico, se cuenta una vez por cada mecánico asignado."
                arrow
                placement="top"
              >
                <Box>
                  <KPICard
                    label="Órdenes terminadas"
                    value={kpis?.ordenesTerminadas ?? null}
                    format="number"
                    loading={loading}
                  />
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title="Mano de obra total con IVA dividido la cantidad de órdenes terminadas. Representa el ingreso promedio de mano de obra por orden."
                arrow
                placement="top"
              >
                <Box>
                  <KPICard
                    label="Ticket promedio MdO"
                    value={kpis?.ticketPromedio ?? null}
                    loading={loading}
                  />
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title="Cantidad de mecánicos distintos con al menos una orden terminada en el período."
                arrow
                placement="top"
              >
                <Box>
                  <KPICard
                    label="Mecánicos activos"
                    value={kpis?.cantidadMecanicos ?? null}
                    format="number"
                    loading={loading}
                  />
                </Box>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Disclaimer general */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 3,
              backgroundColor: "action.hover",
              borderRadius: 2,
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, mt: 0.3, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Los montos representan la <strong>mano de obra con IVA</strong> de
              órdenes terminadas, sin descontar el descuento de mano de obra.
              En reparaciones compartidas (más de un mecánico), el 100% de la
              mano de obra se atribuye a cada mecánico asignado, por lo que la
              suma individual puede ser mayor al total real.
              Solo se consideran órdenes con estado &quot;Terminado&quot;.
            </Typography>
          </Paper>

          {/* Comparativa de ganancias */}
          <Paper
            elevation={0}
            sx={{ mb: 3, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}
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
              <BarChartIcon color="primary" />
              Comparativa de Mano de Obra por Mecánico
              <InfoTooltip title="Mano de obra con IVA por semana. Cada línea representa un mecánico. En órdenes compartidas, el monto completo se atribuye a cada mecánico." />
            </Typography>
            <Box sx={{ p: 2, height: 400 }}>
              <Line
                data={{
                  labels: chartLabels,
                  datasets: data.map((mec, i) => ({
                    label: mec.mecanicoNombre,
                    data: mec.gananciasSemanales.map((w) => w.ganancia),
                    borderColor: CHART_COLORS[i % CHART_COLORS.length].border,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length].background,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                  })),
                }}
                options={{
                  ...(commonOptions as any),
                  plugins: {
                    ...commonOptions.plugins,
                    legend: {
                      display: true,
                      position: "top" as const,
                      labels: { padding: 20, font: { size: 12 } },
                    },
                  },
                }}
              />
            </Box>
          </Paper>

          {/* Gráficos individuales por mecánico */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {data.map((mec) => (
              <Grid item xs={12} md={6} key={mec.mecanicoId}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: 350,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BuildIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {mec.mecanicoNombre}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Tooltip title="Mano de obra total con IVA generada por este mecánico en el período." arrow>
                        <Typography variant="body2" color="text.secondary">
                          Total: {formatCurrency(mec.gananciaTotal)}
                        </Typography>
                      </Tooltip>
                      <Tooltip title="Cantidad de órdenes terminadas y ticket promedio (mano de obra c/IVA por orden)." arrow>
                        <Typography variant="caption" color="text.secondary">
                          {mec.ordenesTotal} órdenes &middot; Ticket prom:{" "}
                          {formatCurrency(mec.ticketPromedio)}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2, height: "calc(100% - 80px)" }}>
                    <Line
                      data={{
                        labels: chartLabels,
                        datasets: [
                          {
                            label: mec.mecanicoNombre,
                            data: mec.gananciasSemanales.map((w) => w.ganancia),
                            borderColor: "rgba(75, 192, 192, 1)",
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={commonOptions as any}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Detalle semanal */}
          <Paper
            elevation={0}
            sx={{ mb: 3, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}
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
              <TableChartIcon color="primary" />
              Detalle Semanal por Mecánico
              <InfoTooltip title="Mano de obra con IVA desglosada por semana y mecánico. Debajo de cada monto se muestra la cantidad de órdenes de esa semana." />
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell>Semana</TableCell>
                    {data.map((mec) => (
                      <TableCell key={mec.mecanicoId} align="right">
                        {mec.mecanicoNombre}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data[0]?.gananciasSemanales.map((week, weekIndex) => (
                    <TableRow key={weekIndex} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDateShort(week.weekStart)} -{" "}
                        {formatDateShort(week.weekEnd)}
                      </TableCell>
                      {data.map((mec) => {
                        const w = mec.gananciasSemanales[weekIndex];
                        return (
                          <TableCell key={mec.mecanicoId} align="right">
                            <Box>
                              {formatCurrency(w.ganancia)}
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                {w.cantidadOrdenes}{" "}
                                {w.cantidadOrdenes === 1 ? "orden" : "órdenes"}
                              </Typography>
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                    {data.map((mec) => (
                      <TableCell
                        key={mec.mecanicoId}
                        align="right"
                        sx={{ fontWeight: "bold" }}
                      >
                        <Box>
                          {formatCurrency(mec.gananciaTotal)}
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {mec.ordenesTotal} órdenes
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Órdenes compartidas */}
          {ordenesCompartidas.length > 0 && (
            <Paper
              elevation={0}
              sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}
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
                <GroupIcon color="primary" />
                Reparaciones Compartidas
                <Chip
                  label={ordenesCompartidas.length}
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                />
                <InfoTooltip title="Órdenes terminadas donde participaron 2 o más mecánicos. La mano de obra de estas órdenes se atribuye al 100% a cada mecánico en los gráficos y KPIs de arriba." />
              </Typography>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Orden #</TableCell>
                      <TableCell>Fecha salida</TableCell>
                      <TableCell align="right">
                        MdO c/IVA
                        <InfoTooltip title="Mano de obra con IVA total de la orden. Este monto se contabiliza completo para cada mecánico listado." />
                      </TableCell>
                      <TableCell>Mecánicos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordenesCompartidas.map((o) => (
                      <TableRow key={o.ordenId} hover>
                        <TableCell>{o.ordenId}</TableCell>
                        <TableCell>{formatDateShort(o.fechaSalida)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(o.manoDeObraConIva)}
                        </TableCell>
                        <TableCell>{o.mecanicos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
