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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PieChartIcon from "@mui/icons-material/PieChart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Paper,
  Tab,
  Tabs,
  Tooltip as MuiTooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface KpiFinanciero {
  facturacion: number;
  costo: number;
  ganancia: number;
  cantidad: number;
}

interface DetalleOrden {
  id: number;
  tipo: string;
  fecha: string;
  cliente_nombre: string | null;
  total_repuestos_venta: number;
  total_repuestos_costo: number;
  total_terceros_venta: number;
  total_terceros_costo: number;
  total_trabajos: number;
  incremento: number;
  incremento_interno: number;
  descuento: number;
  total_cliente: number;
  costo_taller: number;
  ganancia: number;
}

interface EvolucionMensual {
  label: string;
  facturacion: number;
  costo: number;
  ganancia: number;
}

interface Composicion {
  repuestos: number;
  manoDeObra: number;
  terceros: number;
}

interface FlujoCaja {
  cobrado: number;
  gastos: number;
  balance: number;
}

interface CategoriaGasto {
  nombre: string;
  total: number;
}

interface TipoOperacion {
  label: string;
  total: number;
  es_ingreso: boolean;
}

interface EvolucionCaja {
  label: string;
  cobrado: number;
  gastos: number;
  balance: number;
}

interface BalanceData {
  rentabilidad: {
    kpis: KpiFinanciero;
    kpisPrev: KpiFinanciero;
    detalle: DetalleOrden[];
    evolucion: EvolucionMensual[];
    composicion: Composicion;
  };
  flujoCaja: {
    kpis: FlujoCaja;
    kpisPrev: FlujoCaja;
    categorias: CategoriaGasto[];
    tiposOperacion: TipoOperacion[];
    evolucion: EvolucionCaja[];
  };
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

// Colores alineados con estadisticas-v2
const CHART_COLORS = {
  blue: "rgba(66, 165, 245, 1)",
  blueBg: "rgba(66, 165, 245, 0.7)",
  green: "rgba(102, 187, 106, 1)",
  greenBg: "rgba(102, 187, 106, 0.7)",
  red: "rgba(239, 83, 80, 1)",
  redBg: "rgba(239, 83, 80, 0.7)",
  orange: "rgba(255, 167, 38, 1)",
  orangeBg: "rgba(255, 167, 38, 0.8)",
};

// ─── Tab: Flujo de Caja ─────────────────────────────────────────────────────

function TabFlujoCaja({
  data,
  loading,
}: {
  data: BalanceData | null;
  loading: boolean;
}) {
  const theme = useTheme();
  const flujo = data?.flujoCaja;

  const evolucionChart = flujo?.evolucion.length ? (
    <Box sx={{ height: 300 }}>
      <Bar
        data={{
          labels: flujo.evolucion.map((e) => e.label),
          datasets: [
            {
              label: "Cobrado",
              data: flujo.evolucion.map((e) => e.cobrado),
              backgroundColor: CHART_COLORS.greenBg,
              borderColor: CHART_COLORS.green,
              borderWidth: 1,
            },
            {
              label: "Gastos",
              data: flujo.evolucion.map((e) => e.gastos),
              backgroundColor: CHART_COLORS.redBg,
              borderColor: CHART_COLORS.red,
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
            y: {
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
      key: "cobrado",
      label: "Cobrado",
      align: "right",
      format: formatCurrency,
    },
    { key: "gastos", label: "Gastos", align: "right", format: formatCurrency },
    {
      key: "balance",
      label: "Balance",
      align: "right",
      render: (v: number) => (
        <Typography
          variant="body2"
          sx={{
            color: v >= 0 ? "success.main" : "error.main",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </Typography>
      ),
    },
  ];

  const categoriasChart =
    flujo?.categorias.length ? (
      <Box
        sx={{
          height: Math.max(200, (flujo.categorias.length || 1) * 40),
        }}
      >
        <Bar
          data={{
            labels: flujo.categorias.map((c) => c.nombre),
            datasets: [
              {
                data: flujo.categorias.map((c) => c.total),
                backgroundColor: CHART_COLORS.redBg,
                borderColor: CHART_COLORS.red,
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

  const categoriasColumns: TableColumn[] = [
    { key: "nombre", label: "Categoría" },
    { key: "total", label: "Total", align: "right", format: formatCurrency },
  ];

  const tiposChart =
    flujo?.tiposOperacion.length ? (
      <Box
        sx={{
          height: Math.max(200, (flujo.tiposOperacion.length || 1) * 40),
        }}
      >
        <Bar
          data={{
            labels: flujo.tiposOperacion.map((t) => t.label),
            datasets: [
              {
                data: flujo.tiposOperacion.map((t) => t.total),
                backgroundColor: flujo.tiposOperacion.map((t) =>
                  t.es_ingreso ? CHART_COLORS.greenBg : CHART_COLORS.redBg
                ),
                borderColor: flujo.tiposOperacion.map((t) =>
                  t.es_ingreso ? CHART_COLORS.green : CHART_COLORS.red
                ),
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

  const tiposColumns: TableColumn[] = [
    { key: "label", label: "Tipo" },
    { key: "total", label: "Total", align: "right", format: formatCurrency },
    {
      key: "es_ingreso",
      label: "Tipo",
      render: (v: boolean) => (
        <Typography
          variant="body2"
          sx={{ color: v ? "success.main" : "error.main", fontWeight: 500 }}
        >
          {v ? "Ingreso" : "Egreso"}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <KPICard
            label="Ingresos cobrados"
            value={flujo?.kpis.cobrado ?? null}
            previousValue={flujo?.kpisPrev.cobrado}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            label="Gastos operativos"
            value={flujo?.kpis.gastos ?? null}
            previousValue={flujo?.kpisPrev.gastos}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            label="Balance de caja"
            value={flujo?.kpis.balance ?? null}
            previousValue={flujo?.kpisPrev.balance}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ChartWithDetail
            title="Evolución mensual"
            icon={
              <TrendingUpIcon
                sx={{ color: theme.palette.primary.main }}
              />
            }
            chart={evolucionChart}
            columns={evolucionColumns}
            rows={flujo?.evolucion ?? []}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Gastos por categoría"
            icon={
              <TrendingDownIcon sx={{ color: theme.palette.error.main }} />
            }
            chart={categoriasChart}
            columns={categoriasColumns}
            rows={flujo?.categorias ?? []}
            loading={loading}
            emptyMessage="Sin gastos en el período"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Por tipo de operación"
            icon={
              <ReceiptLongIcon sx={{ color: theme.palette.info.main }} />
            }
            chart={tiposChart}
            columns={tiposColumns}
            rows={flujo?.tiposOperacion ?? []}
            loading={loading}
            emptyMessage="Sin operaciones en el período"
          />
        </Grid>
      </Grid>
    </>
  );
}

// ─── Tab: Rentabilidad ──────────────────────────────────────────────────────

function TabRentabilidad({
  data,
  loading,
}: {
  data: BalanceData | null;
  loading: boolean;
}) {
  const theme = useTheme();
  const rent = data?.rentabilidad;

  const margen =
    rent && rent.kpis.facturacion > 0
      ? (rent.kpis.ganancia / rent.kpis.facturacion) * 100
      : 0;
  const margenPrev =
    rent && rent.kpisPrev.facturacion > 0
      ? (rent.kpisPrev.ganancia / rent.kpisPrev.facturacion) * 100
      : 0;

  const evolucionChart = rent?.evolucion.length ? (
    <Box sx={{ height: 300 }}>
      <Bar
        data={{
          labels: rent.evolucion.map((e) => e.label),
          datasets: [
            {
              label: "Facturación",
              data: rent.evolucion.map((e) => e.facturacion),
              backgroundColor: CHART_COLORS.blueBg,
              borderColor: CHART_COLORS.blue,
              borderWidth: 1,
            },
            {
              label: "Costo",
              data: rent.evolucion.map((e) => e.costo),
              backgroundColor: CHART_COLORS.redBg,
              borderColor: CHART_COLORS.red,
              borderWidth: 1,
            },
            {
              label: "Ganancia",
              data: rent.evolucion.map((e) => e.ganancia),
              backgroundColor: CHART_COLORS.greenBg,
              borderColor: CHART_COLORS.green,
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
            y: {
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
      key: "facturacion",
      label: "Facturación",
      align: "right",
      format: formatCurrency,
    },
    { key: "costo", label: "Costo", align: "right", format: formatCurrency },
    {
      key: "ganancia",
      label: "Ganancia",
      align: "right",
      render: (v: number) => (
        <Typography
          variant="body2"
          sx={{
            color: v >= 0 ? "success.main" : "error.main",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </Typography>
      ),
    },
  ];

  // Composición doughnut
  const composicion = rent?.composicion;
  const compTotal =
    (composicion?.repuestos ?? 0) +
    (composicion?.manoDeObra ?? 0) +
    (composicion?.terceros ?? 0);

  const composicionChart =
    compTotal > 0 ? (
      <Box
        sx={{
          height: 250,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Doughnut
          data={{
            labels: ["Repuestos", "Mano de obra", "Terceros"],
            datasets: [
              {
                data: [
                  composicion!.repuestos,
                  composicion!.manoDeObra,
                  composicion!.terceros,
                ],
                backgroundColor: [
                  CHART_COLORS.blueBg,
                  CHART_COLORS.greenBg,
                  CHART_COLORS.orangeBg,
                ],
                borderColor: [
                  CHART_COLORS.blue,
                  CHART_COLORS.green,
                  CHART_COLORS.orange,
                ],
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
                    const pct = ((ctx.parsed / compTotal) * 100).toFixed(1);
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
    { key: "label", label: "Componente" },
    { key: "total", label: "Total", align: "right", format: formatCurrency },
    {
      key: "porcentaje",
      label: "%",
      align: "right",
      format: (v: number) => `${v.toFixed(1)}%`,
    },
  ];
  const composicionRows = composicion
    ? [
        {
          label: "Repuestos",
          total: composicion.repuestos,
          porcentaje: compTotal > 0 ? (composicion.repuestos / compTotal) * 100 : 0,
        },
        {
          label: "Mano de obra",
          total: composicion.manoDeObra,
          porcentaje: compTotal > 0 ? (composicion.manoDeObra / compTotal) * 100 : 0,
        },
        {
          label: "Terceros",
          total: composicion.terceros,
          porcentaje: compTotal > 0 ? (composicion.terceros / compTotal) * 100 : 0,
        },
      ]
    : [];

  // Detalle table
  const detalleColumns: TableColumn[] = [
    {
      key: "id",
      label: "#",
      render: (v: number, row: Record<string, any>) => {
        const path =
          row.tipo === "OdR"
            ? `/dashboard/ordenes-reparacion/${v}`
            : `/dashboard/ventas/${v}`;
        return (
          <MuiLink component={Link} href={path} underline="hover">
            {row.tipo} #{v}
          </MuiLink>
        );
      },
    },
    { key: "cliente_nombre", label: "Cliente" },
    {
      key: "total_trabajos",
      label: "M. de obra",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "total_repuestos_venta",
      label: "Repuestos",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "total_terceros_venta",
      label: "Terceros",
      align: "right",
      format: formatCurrency,
    },
    {
      key: "total_cliente",
      label: "Facturado",
      align: "right",
      format: formatCurrency,
      headerSx: { fontWeight: 700 },
    },
    {
      key: "costo_taller",
      label: "Costo",
      align: "right",
      format: formatCurrency,
      sx: { color: "error.main" },
    },
    {
      key: "ganancia",
      label: "Ganancia",
      align: "right",
      render: (v: number) => (
        <Typography
          variant="body2"
          sx={{
            color: v >= 0 ? "success.main" : "error.main",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Facturación total"
            value={rent?.kpis.facturacion ?? null}
            previousValue={rent?.kpisPrev.facturacion}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Costo total"
            value={rent?.kpis.costo ?? null}
            previousValue={rent?.kpisPrev.costo}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Ganancia bruta"
            value={rent?.kpis.ganancia ?? null}
            previousValue={rent?.kpisPrev.ganancia}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Margen bruto"
            value={margen}
            previousValue={margenPrev}
            format="percent"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartWithDetail
            title="Evolución mensual"
            icon={
              <TrendingUpIcon
                sx={{ color: theme.palette.primary.main }}
              />
            }
            chart={evolucionChart}
            columns={evolucionColumns}
            rows={rent?.evolucion ?? []}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartWithDetail
            title="Composición de facturación"
            icon={
              <PieChartIcon sx={{ color: theme.palette.secondary.main }} />
            }
            chart={composicionChart}
            columns={composicionColumns}
            rows={composicionRows}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <ChartWithDetail
            title={`Detalle por orden/venta (${rent?.detalle.length ?? 0})`}
            icon={
              <ReceiptLongIcon
                sx={{ color: theme.palette.primary.main }}
              />
            }
            chart={null}
            columns={detalleColumns}
            rows={rent?.detalle ?? []}
            loading={loading}
            emptyMessage="Sin órdenes o ventas en el período"
          />
        </Grid>
      </Grid>
    </>
  );
}

// ─── Tab: Balance General ───────────────────────────────────────────────────

function TabBalanceGeneral({
  data,
  loading,
}: {
  data: BalanceData | null;
  loading: boolean;
}) {
  const theme = useTheme();
  const rent = data?.rentabilidad;
  const flujo = data?.flujoCaja;

  const balanceCajaChart = flujo?.evolucion.length ? (
    <Box sx={{ height: 300 }}>
      <Line
        data={{
          labels: flujo.evolucion.map((e) => e.label),
          datasets: [
            {
              label: "Balance de caja",
              data: flujo.evolucion.map((e) => e.balance),
              borderColor: CHART_COLORS.blue,
              backgroundColor: "rgba(66, 165, 245, 0.3)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
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
                  `Balance: ${formatCurrency(ctx.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            y: {
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

  const balanceColumns: TableColumn[] = [
    { key: "label", label: "Mes" },
    {
      key: "balance",
      label: "Balance",
      align: "right",
      render: (v: number) => (
        <Typography
          variant="body2"
          sx={{
            color: v >= 0 ? "success.main" : "error.main",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </Typography>
      ),
    },
  ];

  const margen =
    rent && rent.kpis.facturacion > 0
      ? (rent.kpis.ganancia / rent.kpis.facturacion) * 100
      : 0;

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Cobrado"
            value={flujo?.kpis.cobrado ?? null}
            previousValue={flujo?.kpisPrev.cobrado}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Gastos operativos"
            value={flujo?.kpis.gastos ?? null}
            previousValue={flujo?.kpisPrev.gastos}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Balance de caja"
            value={flujo?.kpis.balance ?? null}
            previousValue={flujo?.kpisPrev.balance}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            label="Margen de trabajo"
            value={margen}
            previousValue={null}
            format="percent"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Evolución balance de caja"
            icon={
              <AccountBalanceIcon
                sx={{ color: theme.palette.primary.main }}
              />
            }
            chart={balanceCajaChart}
            columns={balanceColumns}
            rows={flujo?.evolucion ?? []}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <MonetizationOnIcon sx={{ color: theme.palette.primary.main }} />
              Resumen del período
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" height={200}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <SummaryRow
                  label="Facturación (trabajos completados)"
                  value={rent?.kpis.facturacion ?? 0}
                  tooltip="Suma de todo lo facturado a clientes en OdR (estado Terminado/SeRetira) y Ventas (estado Entregado/Cerrado). Incluye: precio de venta de repuestos (con recargo redondeado a $500), servicios de terceros, mano de obra, incrementos e incremento interno, menos descuentos. Filtra por fecha de creación de la OdR o fecha de la Venta."
                />
                <SummaryRow
                  label="Costo de producción"
                  value={-(rent?.kpis.costo ?? 0)}
                  color="error.main"
                  tooltip="Lo que le costó al taller producir esos trabajos. Incluye: precio de compra de repuestos usados (× unidades consumidas) + precio de compra de servicios de terceros. NO incluye mano de obra propia (es ganancia directa). Mismo filtro de fechas y estados que facturación."
                />
                <SummaryRow
                  label="Ganancia bruta"
                  value={rent?.kpis.ganancia ?? 0}
                  bold
                  divider
                  tooltip="Facturación menos costo de producción. Representa el margen bruto del trabajo realizado, sin considerar gastos operativos del taller (alquiler, sueldos, etc)."
                />
                <SummaryRow
                  label="Cobrado (caja)"
                  value={flujo?.kpis.cobrado ?? 0}
                  tooltip="Dinero que efectivamente entró a la caja. Suma de: pagos recibidos por reparaciones (IngresoPorReparacion), pagos de ventas (IngresoPorVenta) e ingresos manuales de caja (IngresoManualDeDinero). Los montos en dólares se convierten usando la cotización del momento. Filtra por fecha del pago/ingreso, no por fecha de la orden."
                />
                <SummaryRow
                  label="Gastos operativos"
                  value={-(flujo?.kpis.gastos ?? 0)}
                  color="error.main"
                  tooltip="Dinero que salió de la caja. Incluye: gastos registrados (alquiler, servicios, insumos, sueldos, etc. por categoría) + extracciones de caja. Los montos en dólares se convierten usando la cotización registrada. Filtra por fecha del gasto/extracción."
                />
                <SummaryRow
                  label="Balance de caja"
                  value={flujo?.kpis.balance ?? 0}
                  bold
                  divider
                  tooltip="Cobrado menos gastos operativos. Refleja el flujo de caja neto: cuánta plata quedó (o faltó) en el período. Puede diferir de la ganancia bruta porque los cobros y pagos no siempre coinciden con la fecha de facturación."
                />
                <SummaryRow
                  label="Trabajos completados"
                  value={rent?.kpis.cantidad ?? 0}
                  isCurrency={false}
                  tooltip="Cantidad de OdR en estado Terminado/SeRetira + Ventas en estado Entregado/Cerrado dentro del rango de fechas seleccionado."
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

function SummaryRow({
  label,
  value,
  color,
  bold,
  divider,
  isCurrency = true,
  tooltip,
}: {
  label: string;
  value: number;
  color?: string;
  bold?: boolean;
  divider?: boolean;
  isCurrency?: boolean;
  tooltip?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.2,
        ...(divider
          ? { borderBottom: "1px solid", borderColor: "divider", mb: 1 }
          : {}),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: bold ? 700 : 400, color: "text.secondary" }}
        >
          {label}
        </Typography>
        {tooltip && (
          <MuiTooltip
            title={tooltip}
            arrow
            placement="right"
            slotProps={{
              tooltip: {
                sx: { maxWidth: 320, fontSize: "0.8rem", lineHeight: 1.5 },
              },
            }}
          >
            <InfoOutlinedIcon
              sx={{
                fontSize: 16,
                color: "text.disabled",
                cursor: "help",
              }}
            />
          </MuiTooltip>
        )}
      </Box>
      <Typography
        variant="body1"
        sx={{
          fontWeight: bold ? 700 : 500,
          color: color ?? (value >= 0 ? "text.primary" : "error.main"),
        }}
      >
        {isCurrency ? formatCurrency(value) : value}
      </Typography>
    </Box>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function BalancePage() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const { authFetch } = useFetch();

  const fetchData = useCallback(
    async (filtro?: FiltroEstadisticas) => {
      setLoading(true);
      try {
        const url = new URL(
          "/api/estadisticas/balanceDetallado",
          window.location.origin
        );
        if (filtro?.from) url.searchParams.set("from", filtro.from);
        if (filtro?.to) url.searchParams.set("to", filtro.to);

        const response = await authFetch(url.toString());
        if (!response.ok) throw new Error("Error al obtener datos");
        const json = await response.json();
        setData(json);
      } catch {
        setData(null);
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
    <div>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Balance Financiero
      </Typography>

      <GlobalFilters
        onApply={fetchData}
        defaultFrom={getDefaultFrom()}
        defaultTo={getDefaultTo()}
      />

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Resumen" />
          <Tab label="Flujo de caja" />
          <Tab label="Rentabilidad" />
        </Tabs>
      </Paper>

      {tab === 0 && <TabBalanceGeneral data={data} loading={loading} />}
      {tab === 1 && <TabFlujoCaja data={data} loading={loading} />}
      {tab === 2 && <TabRentabilidad data={data} loading={loading} />}
    </div>
  );
}

export default BalancePage;
