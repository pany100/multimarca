"use client";

import { useFetch } from "@/contexts/FetchContext";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import { useCallback, useEffect, useState } from "react";
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

interface WeeklyBalanceResult {
  weekStart: string;
  weekEnd: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

interface BalanceDetalladoData {
  data: WeeklyBalanceResult[];
  moneda: string;
}

function BalancePage() {
  const theme = useTheme();
  const [balanceData, setBalanceData] = useState<BalanceDetalladoData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moneda, setMoneda] = useState("ARS");
  const { authFetch } = useFetch();

  const obtenerBalanceDetallado = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(
        "/api/estadisticas/balanceDetallado",
        window.location.origin
      );
      url.searchParams.append("moneda", moneda);

      const response = await authFetch(url.toString());
      if (!response.ok) {
        throw new Error("Error al obtener los datos del balance detallado");
      }
      const data = await response.json();
      setBalanceData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [moneda, authFetch]);

  useEffect(() => {
    obtenerBalanceDetallado();
  }, [obtenerBalanceDetallado]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

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

    if (!balanceData || !balanceData.data || balanceData.data.length === 0) {
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

    const chartLabels = balanceData.data.map(
      (week) => `${formatDate(week.weekStart)} - ${formatDate(week.weekEnd)}`
    );

    // Configuración común para los gráficos
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
                label += formatCurrency(context.parsed.y, balanceData.moneda);
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
                currency: balanceData.moneda,
                notation: "compact",
                compactDisplay: "short",
              }).format(value);
            },
          },
        },
      },
    };

    // Datos para el gráfico de balance
    const balanceChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "Balance",
          data: balanceData.data.map((week) => week.balance),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Datos para el gráfico de ingresos
    const ingresosChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "Ingresos",
          data: balanceData.data.map((week) => week.ingresos),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    // Datos para el gráfico de gastos
    const gastosChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "Gastos",
          data: balanceData.data.map((week) => week.gastos),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };

    return (
      <>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
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
                <AccountBalanceIcon
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                Balance
              </Typography>
              <Box
                sx={{
                  p: 2,
                  height: "400px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Line data={balanceChartData} options={commonOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
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
                <TrendingUpIcon
                  sx={{ mr: 1, color: theme.palette.success.main }}
                />
                Ingresos
              </Typography>
              <Box sx={{ p: 2, height: "400px" }}>
                <Line data={ingresosChartData} options={commonOptions} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
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
                <TrendingDownIcon
                  sx={{ mr: 1, color: theme.palette.error.main }}
                />
                Gastos
              </Typography>
              <Box sx={{ p: 2, height: "400px" }}>
                <Line data={gastosChartData} options={commonOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

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
            <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Detalle Semanal
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Semana</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                  <TableCell align="right">Gastos</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balanceData.data.map((week, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: theme.palette.success.main }}
                    >
                      {formatCurrency(week.ingresos, balanceData.moneda)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: theme.palette.error.main }}
                    >
                      {formatCurrency(week.gastos, balanceData.moneda)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          week.balance >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(week.balance, balanceData.moneda)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </>
    );
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Balance Detallado
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
            onClick={() => setMoneda("ARS")}
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
            onClick={() => setMoneda("USD")}
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
          <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Balance Financiero - Últimas 10 Semanas
        </Typography>

        <Box sx={{ p: 3 }}>{renderContent()}</Box>
      </Paper>
    </div>
  );
}

export default BalancePage;
