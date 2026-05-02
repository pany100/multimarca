"use client";

import { useFetch } from "@/contexts/FetchContext";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Alert, AlertTitle, Box, Grid, Link, Tooltip as MuiTooltip } from "@mui/material";
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

interface IvaCategorias {
  manoDeObra: number;
  repuestos: number;
  terceros: number;
  total: number;
}

interface IvaPorDescuentoData {
  absorbido: IvaCategorias;
  recuperado: IvaCategorias;
}

interface ResumenExtendidoData {
  comprasRepuestos: number;
  comprasRepuestosPrev: number;
  gananciaIva: { taller: number; terceros: number; total: number };
  gananciaIvaPrev: { taller: number; terceros: number; total: number };
  ivaPorDescuento: IvaPorDescuentoData;
  ivaPorDescuentoPrev: IvaPorDescuentoData;
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

  // IVA por descuento (donut con absorbido + tabla con ambas métricas)
  const ivaDesc = extendido?.ivaPorDescuento;
  const ivaAbs = ivaDesc?.absorbido;
  const ivaRec = ivaDesc?.recuperado;
  const absorbidoTotal = ivaAbs?.total ?? 0;
  const ivaChartData = {
    labels: ["Mano de obra", "Repuestos taller", "Repuestos terceros"],
    datasets: [
      {
        label: "IVA absorbido",
        data: ivaAbs
          ? [ivaAbs.manoDeObra, ivaAbs.repuestos, ivaAbs.terceros]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(239, 83, 80, 0.8)",
          "rgba(239, 83, 80, 0.6)",
          "rgba(239, 83, 80, 0.4)",
        ],
        borderColor: "rgba(239, 83, 80, 1)",
        borderWidth: 1,
      },
    ],
  };
  const ivaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct =
              absorbidoTotal > 0
                ? ((val / absorbidoTotal) * 100).toFixed(1)
                : "0";
            return `${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
  };
  const ivaRows = ivaDesc
    ? [
        {
          fuente: "Mano de obra",
          absorbido: ivaAbs!.manoDeObra,
          recuperado: ivaRec!.manoDeObra,
          total: ivaAbs!.manoDeObra + ivaRec!.manoDeObra,
        },
        {
          fuente: "Repuestos taller",
          absorbido: ivaAbs!.repuestos,
          recuperado: ivaRec!.repuestos,
          total: ivaAbs!.repuestos + ivaRec!.repuestos,
        },
        {
          fuente: "Repuestos terceros",
          absorbido: ivaAbs!.terceros,
          recuperado: ivaRec!.terceros,
          total: ivaAbs!.terceros + ivaRec!.terceros,
        },
      ]
    : [];

  const ivaColumns: TableColumn[] = [
    { key: "fuente", label: "Categoría" },
    {
      key: "absorbido",
      label: "IVA absorbido",
      align: "right",
      format: formatCurrency,
      sx: costoSx,
      headerSx: costoHeaderSx,
    },
    {
      key: "recuperado",
      label: "IVA recuperado",
      align: "right",
      format: formatCurrency,
      sx: ventaSx,
      headerSx: ventaHeaderSx,
    },
    {
      key: "total",
      label: "IVA total contenido",
      align: "right",
      format: formatCurrency,
      sx: { fontWeight: 600 },
      headerSx: { fontWeight: 800 },
    },
  ];

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
          <MuiTooltip
            arrow
            placement="top"
            title="IVA que el taller deja de cobrar cuando aplica un descuento sobre un total que ya incluye IVA (también llamado 'sobrante de IVA por descuento'). Por cada OdR/Venta con descuento: monto = descuento × IVA / (100 + IVA), prorrateado entre mano de obra, repuestos y terceros según su peso en la facturación."
          >
            <Box>
              <KPICard
                label="IVA absorbido por descuento"
                value={extendido?.ivaPorDescuento.absorbido.total ?? null}
                previousValue={extendido?.ivaPorDescuentoPrev.absorbido.total}
                subtitle="IVA cedido por el descuento"
                loading={loading}
              />
            </Box>
          </MuiTooltip>
        </Grid>
        <Grid item xs={6} md={2}>
          <MuiTooltip
            arrow
            placement="top"
            title="IVA contenido en el monto efectivamente cobrado al cliente (post-descuento). Por línea: (línea − parte del descuento) × IVA / (100 + IVA). Solo considera OdRs/Ventas con descuento. Sumado al absorbido = IVA total que se hubiera cobrado sin descuento."
          >
            <Box>
              <KPICard
                label="IVA recuperado post-descuento"
                value={extendido?.ivaPorDescuento.recuperado.total ?? null}
                previousValue={extendido?.ivaPorDescuentoPrev.recuperado.total}
                subtitle="IVA en lo cobrado al cliente"
                loading={loading}
              />
            </Box>
          </MuiTooltip>
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

      {/* IVA por descuento (absorbido + recuperado) */}
      <Box sx={{ mt: 3 }}>
        <ChartWithDetail
          title="IVA por descuento"
          icon={<ReceiptLongIcon color="primary" />}
          loading={loading}
          columns={ivaColumns}
          rows={ivaRows}
          chart={
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle sx={{ fontWeight: 600 }}>¿Qué es esto?</AlertTitle>
                El total al cliente ya incluye IVA. Cuando aplicás un descuento
                sobre ese total, ese IVA contenido se parte en dos:
                <Box component="ul" sx={{ pl: 2.5, mt: 1, mb: 0 }}>
                  <li>
                    <strong>IVA absorbido</strong> — la porción del IVA que
                    estaba contenida en lo que descontaste. Es lo que el taller{" "}
                    <em>deja de cobrar</em>. Fórmula por línea:{" "}
                    <em>(parte del descuento) × IVA / (100 + IVA)</em>.
                  </li>
                  <li>
                    <strong>IVA recuperado</strong> — el IVA que sí está
                    contenido en lo que el cliente terminó pagando (post-descuento).
                    Fórmula por línea:{" "}
                    <em>(línea − parte del descuento) × IVA / (100 + IVA)</em>.
                  </li>
                  <li>
                    Suma de absorbido + recuperado = IVA total que se hubiera
                    cobrado <em>sin</em> descuento.
                  </li>
                  <li>
                    El descuento se prorratea entre mano de obra, repuestos
                    taller y repuestos terceros según el peso de cada uno en la
                    OdR / Venta. Tasa de IVA por línea (21% por defecto).
                  </li>
                </Box>
              </Alert>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ maxWidth: 500, width: "100%" }}>
                  <Doughnut
                    data={ivaChartData}
                    options={ivaChartOptions as any}
                  />
                </Box>
              </Box>
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <em
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(0,0,0,0.6)",
                  }}
                >
                  Distribución del IVA absorbido por categoría. El detalle
                  numérico de absorbido y recuperado está en la tabla debajo.
                </em>
              </Box>
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
