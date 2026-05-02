"use client";

import { useFetch } from "@/contexts/FetchContext";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Grid, Link } from "@mui/material";
import GlobalFilters, { FiltroEstadisticas } from "../GlobalFilters";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React, { useCallback, useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartWithDetail, {
  TableColumn,
  formatCurrency,
} from "../ChartWithDetail";
import KPICard from "../KPICard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ResumenData {
  kpis: {
    facturacion: number;
    costo: number;
    ganancia: number;
    cantidad: number;
  };
  kpisPrev: {
    facturacion: number;
    costo: number;
    ganancia: number;
    cantidad: number;
  };
  detalle: any[];
  evolucion: { label: string; facturacion: number; costo: number; ganancia: number }[];
}

interface ComposicionData {
  repuestos: number;
  manoDeObra: number;
  terceros: number;
}

interface SobranteIvaDescuentoData {
  manoDeObra: number;
  repuestos: number;
  terceros: number;
  total: number;
}

interface ResumenExtendidoData {
  comprasRepuestos: number;
  comprasRepuestosPrev: number;
  gananciaIva: { taller: number; terceros: number; total: number };
  gananciaIvaPrev: { taller: number; terceros: number; total: number };
  sobranteIvaDescuento: SobranteIvaDescuentoData;
  sobranteIvaDescuentoPrev: SobranteIvaDescuentoData;
}

function buildQuery(filtro: FiltroEstadisticas): string {
  const params = new URLSearchParams();
  if (filtro.from) params.set("from", filtro.from);
  if (filtro.to) params.set("to", filtro.to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const costoSx = { color: "error.main" };
const costoHeaderSx = { color: "error.main" };
const ventaSx = { color: "success.dark" };
const ventaHeaderSx = { color: "success.dark" };

function buildLink(row: Record<string, any>): string {
  if (row.tipo === "OdR") return `/dashboard/ordenes-reparacion/${row.id}`;
  return `/dashboard/ventas/${row.id}`;
}

function buildLabel(row: Record<string, any>): string {
  if (row.tipo === "OdR") return `OdR #${row.id}`;
  return `Venta #${row.id}`;
}

const evolucionColumns: TableColumn[] = [
  { key: "label", label: "Mes" },
  {
    key: "facturacion",
    label: "Facturación",
    align: "right",
    format: formatCurrency,
    sx: ventaSx,
    headerSx: ventaHeaderSx,
  },
  {
    key: "costo",
    label: "Costo",
    align: "right",
    format: formatCurrency,
    sx: costoSx,
    headerSx: costoHeaderSx,
  },
  {
    key: "ganancia",
    label: "Ganancia",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 700 },
    headerSx: { fontWeight: 800 },
  },
];

const detalleColumns: TableColumn[] = [
  {
    key: "id",
    label: "Orden / Venta",
    render: (_v: any, row: Record<string, any>) =>
      React.createElement(
        Link,
        { href: buildLink(row), underline: "hover", fontWeight: 600 },
        buildLabel(row),
      ),
  },
  {
    key: "fecha",
    label: "Fecha",
    format: (v: string) => (v ? new Date(v).toLocaleDateString("es-AR") : "-"),
  },
  { key: "cliente_nombre", label: "Cliente" },
  {
    key: "total_repuestos_venta",
    label: "Repuestos (venta)",
    align: "right",
    format: formatCurrency,
    sx: ventaSx,
    headerSx: ventaHeaderSx,
  },
  {
    key: "total_repuestos_costo",
    label: "Repuestos (costo)",
    align: "right",
    format: formatCurrency,
    sx: costoSx,
    headerSx: costoHeaderSx,
  },
  {
    key: "total_terceros_venta",
    label: "Terceros (venta)",
    align: "right",
    format: formatCurrency,
    sx: ventaSx,
    headerSx: ventaHeaderSx,
  },
  {
    key: "total_terceros_costo",
    label: "Terceros (costo)",
    align: "right",
    format: formatCurrency,
    sx: costoSx,
    headerSx: costoHeaderSx,
  },
  {
    key: "total_trabajos",
    label: "Mano de obra",
    align: "right",
    format: formatCurrency,
    sx: ventaSx,
    headerSx: ventaHeaderSx,
  },
  {
    key: "ajustes",
    label: "Ajustes",
    align: "right",
    render: (_v: any, row: Record<string, any>) => {
      const val = (row.incremento ?? 0) + (row.incremento_interno ?? 0) - (row.descuento ?? 0);
      return formatCurrency(val);
    },
  },
  {
    key: "total_cliente",
    label: "Total cliente",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 600 },
    headerSx: { fontWeight: 800 },
  },
  {
    key: "costo_taller",
    label: "Costo taller",
    align: "right",
    format: formatCurrency,
    sx: { ...costoSx, fontWeight: 600 },
    headerSx: { ...costoHeaderSx, fontWeight: 800 },
  },
  {
    key: "ganancia",
    label: "Ganancia",
    align: "right",
    format: formatCurrency,
    sx: { fontWeight: 700 },
    headerSx: { fontWeight: 800 },
  },
];

export default function ResumenFinanciero() {
  const { authFetch } = useFetch();
  const [resumen, setResumen] = useState<ResumenData | null>(null);
  const [composicion, setComposicion] = useState<ComposicionData | null>(null);
  const [extendido, setExtendido] = useState<ResumenExtendidoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstadisticas>({ from: null, to: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery(filtro);
      const [resumenRes, composicionRes, extendidoRes] = await Promise.all([
        authFetch(`/api/estadisticas/v2/resumen-financiero${qs}`),
        authFetch(`/api/estadisticas/v2/composicion-facturacion${qs}`),
        authFetch(`/api/estadisticas/v2/resumen-extendido${qs}`),
      ]);
      if (resumenRes.ok) setResumen(await resumenRes.json());
      if (composicionRes.ok) setComposicion(await composicionRes.json());
      if (extendidoRes.ok) setExtendido(await extendidoRes.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch, filtro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = resumen?.kpis;
  const kpisPrev = resumen?.kpisPrev;
  const margen =
    kpis && kpis.facturacion > 0
      ? (kpis.ganancia / kpis.facturacion) * 100
      : 0;
  const margenPrev =
    kpisPrev && kpisPrev.facturacion > 0
      ? (kpisPrev.ganancia / kpisPrev.facturacion) * 100
      : 0;

  // Evolution chart data
  const evolucionLabels =
    resumen?.evolucion.map((e) => e.label) ?? [];
  const evolucionChartData = {
    labels: evolucionLabels,
    datasets: [
      {
        label: "Facturación",
        data: resumen?.evolucion.map((e) => e.facturacion) ?? [],
        backgroundColor: "rgba(66, 165, 245, 0.7)",
        borderColor: "rgba(66, 165, 245, 1)",
        borderWidth: 1,
      },
      {
        label: "Costo",
        data: resumen?.evolucion.map((e) => e.costo) ?? [],
        backgroundColor: "rgba(239, 83, 80, 0.7)",
        borderColor: "rgba(239, 83, 80, 1)",
        borderWidth: 1,
      },
      {
        label: "Ganancia",
        data: resumen?.evolucion.map((e) => e.ganancia) ?? [],
        backgroundColor: "rgba(102, 187, 106, 0.7)",
        borderColor: "rgba(102, 187, 106, 1)",
        borderWidth: 1,
      },
    ],
  };
  const evolucionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed?.y ?? 0;
            return `${ctx.dataset.label}: ${formatCurrency(val)}`;
          },
        },
      },
    },
    scales: {
      y: {
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

  // Composición donut
  const composicionTotal =
    composicion
      ? composicion.repuestos + composicion.manoDeObra + composicion.terceros
      : 0;
  const composicionChartData = {
    labels: ["Repuestos taller", "Mano de obra", "Repuestos terceros"],
    datasets: [
      {
        data: composicion
          ? [composicion.repuestos, composicion.manoDeObra, composicion.terceros]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(66, 165, 245, 0.8)",
          "rgba(102, 187, 106, 0.8)",
          "rgba(255, 167, 38, 0.8)",
        ],
        borderColor: [
          "rgba(66, 165, 245, 1)",
          "rgba(102, 187, 106, 1)",
          "rgba(255, 167, 38, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const composicionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct =
              composicionTotal > 0
                ? ((val / composicionTotal) * 100).toFixed(1)
                : "0";
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  const composicionRows = composicion
    ? [
        {
          fuente: "Repuestos taller",
          monto: composicion.repuestos,
          porcentaje:
            composicionTotal > 0
              ? ((composicion.repuestos / composicionTotal) * 100).toFixed(1) +
                "%"
              : "0%",
        },
        {
          fuente: "Mano de obra",
          monto: composicion.manoDeObra,
          porcentaje:
            composicionTotal > 0
              ? ((composicion.manoDeObra / composicionTotal) * 100).toFixed(1) +
                "%"
              : "0%",
        },
        {
          fuente: "Repuestos terceros",
          monto: composicion.terceros,
          porcentaje:
            composicionTotal > 0
              ? ((composicion.terceros / composicionTotal) * 100).toFixed(1) +
                "%"
              : "0%",
        },
      ]
    : [];

  const composicionColumns: TableColumn[] = [
    { key: "fuente", label: "Fuente" },
    { key: "monto", label: "Monto", align: "right", format: formatCurrency },
    { key: "porcentaje", label: "% del total", align: "right" },
  ];

  // Sobrante de IVA por descuento (donut + tabla)
  const sobrante = extendido?.sobranteIvaDescuento;
  const sobranteTotal = sobrante ? sobrante.total : 0;
  const sobranteChartData = {
    labels: ["Mano de obra", "Repuestos taller", "Repuestos terceros"],
    datasets: [
      {
        data: sobrante
          ? [sobrante.manoDeObra, sobrante.repuestos, sobrante.terceros]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(102, 187, 106, 0.8)",
          "rgba(66, 165, 245, 0.8)",
          "rgba(255, 167, 38, 0.8)",
        ],
        borderColor: [
          "rgba(102, 187, 106, 1)",
          "rgba(66, 165, 245, 1)",
          "rgba(255, 167, 38, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  const sobranteOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct =
              sobranteTotal > 0
                ? ((val / sobranteTotal) * 100).toFixed(1)
                : "0";
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };
  const sobranteRows = sobrante
    ? [
        {
          fuente: "Mano de obra",
          monto: sobrante.manoDeObra,
          porcentaje:
            sobranteTotal > 0
              ? ((sobrante.manoDeObra / sobranteTotal) * 100).toFixed(1) + "%"
              : "0%",
        },
        {
          fuente: "Repuestos taller",
          monto: sobrante.repuestos,
          porcentaje:
            sobranteTotal > 0
              ? ((sobrante.repuestos / sobranteTotal) * 100).toFixed(1) + "%"
              : "0%",
        },
        {
          fuente: "Repuestos terceros",
          monto: sobrante.terceros,
          porcentaje:
            sobranteTotal > 0
              ? ((sobrante.terceros / sobranteTotal) * 100).toFixed(1) + "%"
              : "0%",
        },
      ]
    : [];

  return (
    <Box>
      <GlobalFilters onApply={setFiltro} showPeriodPresets />

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Facturación total"
            value={kpis?.facturacion ?? null}
            previousValue={kpisPrev?.facturacion}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Costo de repuestos"
            value={kpis?.costo ?? null}
            previousValue={kpisPrev?.costo}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Ganancia bruta"
            value={kpis?.ganancia ?? null}
            previousValue={kpisPrev?.ganancia}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Margen bruto"
            value={margen}
            previousValue={margenPrev}
            format="percent"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Compras de repuestos"
            value={extendido?.comprasRepuestos ?? null}
            previousValue={extendido?.comprasRepuestosPrev}
            subtitle="Cash-out a proveedores"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Ganancia por IVA"
            value={extendido?.gananciaIva.total ?? null}
            previousValue={extendido?.gananciaIvaPrev.total}
            subtitle="Taller + terceros"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <KPICard
            label="Sobrante IVA por descuento"
            value={extendido?.sobranteIvaDescuento.total ?? null}
            previousValue={extendido?.sobranteIvaDescuentoPrev.total}
            subtitle="MO + rep + terceros"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Evolución mensual */}
      <ChartWithDetail
        title="Evolución mensual (últimos 6 meses)"
        icon={<AttachMoneyIcon color="primary" />}
        loading={loading}
        columns={evolucionColumns}
        rows={resumen?.evolucion ?? []}
        chart={
          <Box sx={{ height: 350 }}>
            <Bar data={evolucionChartData} options={evolucionOptions as any} />
          </Box>
        }
      />

      {/* Composición de facturación */}
      <Box sx={{ mt: 3 }}>
        <ChartWithDetail
          title="Composición de facturación"
          icon={<DonutLargeIcon color="primary" />}
          loading={loading}
          columns={composicionColumns}
          rows={composicionRows}
          chart={
            <Box
              sx={{
                height: 300,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box sx={{ maxWidth: 500, width: "100%" }}>
                <Doughnut
                  data={composicionChartData}
                  options={composicionOptions as any}
                />
              </Box>
            </Box>
          }
        />
      </Box>

      {/* Sobrante de IVA por descuento */}
      <Box sx={{ mt: 3 }}>
        <ChartWithDetail
          title="Sobrante de IVA por descuento"
          icon={<ReceiptLongIcon color="primary" />}
          loading={loading}
          columns={composicionColumns}
          rows={sobranteRows}
          chart={
            <Box
              sx={{
                height: 300,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box sx={{ maxWidth: 500, width: "100%" }}>
                <Doughnut
                  data={sobranteChartData}
                  options={sobranteOptions as any}
                />
              </Box>
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
