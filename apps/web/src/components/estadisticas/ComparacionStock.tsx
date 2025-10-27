"use client";

import { useFetch } from "@/contexts/FetchContext";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  Box,
  CircularProgress,
  Paper,
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

interface ComparacionStockData {
  costoStock: number;
  plataEnStock: number;
}

const ComparacionStock = () => {
  const theme = useTheme();
  const [stockData, setStockData] = useState<ComparacionStockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const obtenerDatosStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch("/api/estadisticas/evolucion-stock");
      if (!response.ok) {
        throw new Error("Error al obtener los datos del stock");
      }
      const data = await response.json();
      setStockData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    obtenerDatosStock();
  }, [obtenerDatosStock]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (!stockData) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Typography>Sin datos</Typography>
        </Box>
      );
    }

    const ganancia = stockData.plataEnStock - stockData.costoStock;

    const chartData = {
      labels: ["Costo vs Valor de Venta"],
      datasets: [
        {
          label: "Costo del Stock",
          data: [stockData.costoStock],
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Valor de Venta",
          data: [stockData.plataEnStock],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            boxWidth: 15,
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2,
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              return new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                notation: "compact",
                compactDisplay: "short",
              }).format(value);
            },
          },
        },
      },
    };

    return (
      <>
        <Box
          sx={{
            height: "300px",
            mb: 3,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "80%",
              maxWidth: "800px",
              display: "grid",
              justifyContent: "center",
            }}
          >
            <Bar data={chartData} options={options} />
          </Box>
        </Box>
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 1,
            textAlign: "center",
            borderLeft: `4px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Ganancia Potencial:{" "}
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
            }).format(ganancia)}
          </Typography>
        </Box>
      </>
    );
  };

  return (
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
        <InventoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Comparación de Stock
      </Typography>

      <Box sx={{ p: 3 }}>{renderContent()}</Box>
    </Paper>
  );
};

export default ComparacionStock;
