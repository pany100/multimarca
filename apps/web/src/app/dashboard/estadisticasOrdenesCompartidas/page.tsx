"use client";

import { useFetch } from "@/contexts/FetchContext";
import BuildIcon from "@mui/icons-material/Build";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface OrdenCompartidaStats {
  ordenId: number;
  fechaSalida: string;
  mecanicos: {
    id: number;
    nombre: string;
  }[];
  ganancia: number;
}

interface SemanaStats {
  weekStart: string;
  weekEnd: string;
  ordenes: OrdenCompartidaStats[];
  gananciaTotal: number;
  cantidadOrdenes: number;
}

interface OrdenesCompartidasData {
  data: SemanaStats[];
  moneda: string;
}

const EstadisticasOrdenesCompartidasPage = () => {
  const theme = useTheme();
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(true);
  const [ordenesData, setOrdenesData] = useState<OrdenesCompartidasData | null>(
    null
  );
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");

  useEffect(() => {
    const fetchOrdenesData = async () => {
      setLoading(true);
      try {
        const response = await authFetch(
          `/api/estadisticas/mecanicos-compartidas?moneda=${moneda}`
        );
        const data = await response.json();
        setOrdenesData(data);
      } catch (error) {
        console.error("Error al obtener datos de órdenes compartidas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenesData();
  }, [authFetch, moneda]);

  const handleMonedaChange = (newMoneda: "ARS" | "USD") => {
    setMoneda(newMoneda);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda === "ARS" ? "ARS" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderChartData = () => {
    if (!ordenesData) return null;

    const labels = ordenesData.data.map(
      (semana) =>
        `${formatDate(semana.weekStart)} - ${formatDate(semana.weekEnd)}`
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: "Cantidad de órdenes compartidas",
          data: ordenesData.data.map((semana) => semana.cantidadOrdenes),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + "40",
          fill: true,
          tension: 0.4,
        },
        {
          label: `Ganancias (${moneda})`,
          data: ordenesData.data.map((semana) => semana.gananciaTotal),
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.palette.secondary.light + "40",
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de órdenes",
          },
        },
        y1: {
          beginAtZero: true,
          position: "right" as const,
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: `Ganancias (${moneda})`,
          },
        },
      },
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: false,
        },
      },
    };

    return (
      <Box sx={{ height: 300, mb: 4 }}>
        <Line data={chartData} options={options} />
      </Box>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!ordenesData || ordenesData.data.length === 0) {
      return (
        <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
          No hay datos de órdenes compartidas disponibles.
        </Typography>
      );
    }

    return (
      <>
        {renderChartData()}

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Detalle por semana
        </Typography>

        {ordenesData.data.map((semana, index) => (
          <Accordion key={index} sx={{ mb: 2 }} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {formatDate(semana.weekStart)} - {formatDate(semana.weekEnd)}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {semana.cantidadOrdenes}{" "}
                    {semana.cantidadOrdenes === 1 ? "orden" : "órdenes"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(semana.gananciaTotal)}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {semana.ordenes.length > 0 ? (
                semana.ordenes.map((orden) => (
                  <Paper
                    key={orden.ordenId}
                    sx={{ p: 2, mb: 2 }}
                    variant="outlined"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Orden #{orden.ordenId}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(orden.ganancia)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      Fecha de salida:{" "}
                      {new Date(orden.fechaSalida).toLocaleDateString("es-AR")}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Mecánicos:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {orden.mecanicos.map((mecanico) => (
                        <Chip
                          key={mecanico.id}
                          label={mecanico.nombre}
                          icon={<BuildIcon />}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: "center", py: 2 }}>
                  No hay órdenes compartidas en esta semana.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          Estadísticas de Órdenes Compartidas
        </Typography>
        <Box>
          <Typography
            component="span"
            sx={{
              cursor: "pointer",
              fontWeight: moneda === "ARS" ? "bold" : "normal",
              color: moneda === "ARS" ? "primary.main" : "text.secondary",
              mr: 2,
            }}
            onClick={() => handleMonedaChange("ARS")}
          >
            ARS
          </Typography>
          <Typography
            component="span"
            sx={{
              cursor: "pointer",
              fontWeight: moneda === "USD" ? "bold" : "normal",
              color: moneda === "USD" ? "primary.main" : "text.secondary",
            }}
            onClick={() => handleMonedaChange("USD")}
          >
            USD
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <GroupWorkIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Órdenes con Múltiples Mecánicos - Últimas 10 Semanas
        </Typography>

        <Box sx={{ p: 3 }}>{renderContent()}</Box>
      </Paper>
    </Box>
  );
};

export default EstadisticasOrdenesCompartidasPage;
