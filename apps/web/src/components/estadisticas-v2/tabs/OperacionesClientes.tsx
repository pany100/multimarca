"use client";

import { useFetch } from "@/contexts/FetchContext";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupIcon from "@mui/icons-material/Group";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
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
import ChartWithDetail, { TableColumn, formatCurrency } from "../ChartWithDetail";
import KPICard from "../KPICard";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface OperacionesData {
  kpis: { ordenes: number; ventas: number; clientes: number; ticketPromedio: number };
  topClientes: { cliente_nombre: string; total: number }[];
  marcas: { marca: string; cantidad: number }[];
  modelos: { modelo: string; cantidad: number }[];
  marcaSeleccionada: string;
}

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
  "rgba(171, 71, 188, 0.8)",
  "rgba(158, 158, 158, 0.7)",
];

export default function OperacionesClientes() {
  const { authFetch } = useFetch();
  const [data, setData] = useState<OperacionesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marcaSel, setMarcaSel] = useState("");
  const [modelos, setModelos] = useState<{ modelo: string; cantidad: number }[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/estadisticas/v2/operaciones-clientes");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setMarcaSel(d.marcaSeleccionada);
        setModelos(d.modelos);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarcaChange = useCallback(async (marca: string) => {
    setMarcaSel(marca);
    const res = await authFetch(`/api/estadisticas/v2/operaciones-clientes?marca=${encodeURIComponent(marca)}`);
    if (res.ok) {
      const d = await res.json();
      setModelos(d.modelos);
    }
  }, [authFetch]);

  const clienteColumns: TableColumn[] = [
    { key: "cliente_nombre", label: "Cliente" },
    { key: "total", label: "Facturación", align: "right", format: formatCurrency },
  ];

  const marcaColumns: TableColumn[] = [
    { key: "marca", label: "Marca" },
    { key: "cantidad", label: "Atenciones", align: "right" },
    { key: "porcentaje", label: "%", align: "right" },
  ];

  const modeloColumns: TableColumn[] = [
    { key: "modelo", label: "Modelo" },
    { key: "cantidad", label: "Atenciones", align: "right" },
  ];

  // Top clientes - horizontal bar
  const clienteChart = {
    labels: data?.topClientes.map(c => c.cliente_nombre) ?? [],
    datasets: [{
      label: "Facturación",
      data: data?.topClientes.map(c => c.total) ?? [],
      backgroundColor: "rgba(66, 165, 245, 0.7)",
      borderWidth: 1,
    }],
  };
  const clienteOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => formatCurrency(ctx.parsed?.x ?? 0) } },
    },
    scales: {
      x: { beginAtZero: true, ticks: { callback: (v: any) => new Intl.NumberFormat("es-AR", currencyOpts).format(v) } },
    },
  };

  // Marcas - donut (top 5 + otros)
  const totalMarcas = data?.marcas.reduce((acc, m) => acc + m.cantidad, 0) ?? 0;
  const top5Marcas = data?.marcas.slice(0, 5) ?? [];
  const otrosMarcas = data?.marcas.slice(5).reduce((acc, m) => acc + m.cantidad, 0) ?? 0;
  const marcaLabels = [...top5Marcas.map(m => m.marca), ...(otrosMarcas > 0 ? ["OTROS"] : [])];
  const marcaData = [...top5Marcas.map(m => m.cantidad), ...(otrosMarcas > 0 ? [otrosMarcas] : [])];

  const marcaChartData = {
    labels: marcaLabels,
    datasets: [{
      data: marcaData,
      backgroundColor: PIE_COLORS.slice(0, marcaLabels.length),
      borderWidth: 1,
    }],
  };
  const marcaChartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed ?? 0;
            const pct = totalMarcas > 0 ? ((val / totalMarcas) * 100).toFixed(1) : "0";
            return `${ctx.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  const marcaRows = (data?.marcas ?? []).map(m => ({
    ...m,
    porcentaje: totalMarcas > 0 ? ((m.cantidad / totalMarcas) * 100).toFixed(1) + "%" : "0%",
  }));

  // Modelos - horizontal bar
  const modeloChart = {
    labels: modelos.map(m => m.modelo) ?? [],
    datasets: [{
      label: "Atenciones",
      data: modelos.map(m => m.cantidad) ?? [],
      backgroundColor: modelos.map((_, i) => `hsla(${200 + i * 30}, 60%, 55%, 0.7)`) ?? [],
      borderWidth: 1,
    }],
  };
  const modeloOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: "y" as const,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <KPICard label="Órdenes terminadas" value={data?.kpis.ordenes ?? null} format="number" loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Ventas cerradas" value={data?.kpis.ventas ?? null} format="number" loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Clientes atendidos" value={data?.kpis.clientes ?? null} format="number" loading={loading} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KPICard label="Ticket promedio" value={data?.kpis.ticketPromedio ?? null} loading={loading} />
        </Grid>
      </Grid>

      <ChartWithDetail
        title="Top 10 clientes por facturación (mes actual)"
        icon={<GroupIcon color="primary" />}
        loading={loading}
        columns={clienteColumns}
        rows={data?.topClientes ?? []}
        chart={<Box sx={{ height: Math.max(250, (data?.topClientes.length ?? 5) * 40) }}><Bar data={clienteChart} options={clienteOpts as any} /></Box>}
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title="Marcas más atendidas (mes actual)"
            icon={<DirectionsCarIcon color="primary" />}
            loading={loading}
            columns={marcaColumns}
            rows={marcaRows}
            chart={
              <Box sx={{ height: 300, display: "flex", justifyContent: "center" }}>
                <Box sx={{ maxWidth: 450, width: "100%" }}>
                  <Doughnut data={marcaChartData} options={marcaChartOpts as any} />
                </Box>
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartWithDetail
            title={`Modelos de ${marcaSel || "..."}`}
            icon={<DirectionsCarIcon color="primary" />}
            loading={loading}
            columns={modeloColumns}
            rows={modelos}
            chart={
              <Box>
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Marca</InputLabel>
                    <Select value={marcaSel} label="Marca" onChange={(e) => handleMarcaChange(e.target.value)}>
                      {(data?.marcas ?? []).map(m => (
                        <MenuItem key={m.marca} value={m.marca}>{m.marca}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ height: Math.max(200, modelos.length * 40) }}>
                  <Bar data={modeloChart} options={modeloOpts as any} />
                </Box>
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}
