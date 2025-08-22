"use client";

import { useFetch } from "@/contexts/FetchContext";
import BarChartIcon from "@mui/icons-material/BarChart";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
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

interface BalanceData {
  ingresos: number;
  gastos: number;
  balance: number;
  moneda: string;
}

const Balance = () => {
  const theme = useTheme();
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moneda, setMoneda] = useState("ARS");
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const { authFetch } = useFetch();

  const obtenerBalance = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/estadisticas/balance", window.location.origin);
      url.searchParams.append("moneda", moneda);
      if (mes) url.searchParams.append("mes", mes);
      if (anio) url.searchParams.append("año", anio);

      const response = await authFetch(url.toString());
      if (!response.ok) {
        throw new Error("Error al obtener los datos del balance");
      }
      const data = await response.json();
      setBalanceData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [moneda, mes, anio, authFetch]);

  useEffect(() => {
    obtenerBalance();
  }, [obtenerBalance]);

  const actualizarBalance = () => {
    setMes(mesInput);
    setAnio(anioInput);
    obtenerBalance();
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

    if (!balanceData) {
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

    const chartData = {
      labels: ["Ingresos vs Gastos"],
      datasets: [
        {
          label: "Ingresos",
          data: [balanceData.ingresos],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Gastos",
          data: [balanceData.gastos],
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
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
                  currency: balanceData.moneda,
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
                currency: balanceData.moneda,
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
            Balance:{" "}
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: balanceData.moneda,
            }).format(balanceData.balance)}
          </Typography>
        </Box>
      </>
    );
  };

  const meses = [
    { valor: "1", nombre: "Enero" },
    { valor: "2", nombre: "Febrero" },
    { valor: "3", nombre: "Marzo" },
    { valor: "4", nombre: "Abril" },
    { valor: "5", nombre: "Mayo" },
    { valor: "6", nombre: "Junio" },
    { valor: "7", nombre: "Julio" },
    { valor: "8", nombre: "Agosto" },
    { valor: "9", nombre: "Septiembre" },
    { valor: "10", nombre: "Octubre" },
    { valor: "11", nombre: "Noviembre" },
    { valor: "12", nombre: "Diciembre" },
  ];

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
        <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Balance Financiero
      </Typography>

      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Moneda</InputLabel>
                <Select
                  value={moneda}
                  label="Moneda"
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <MenuItem value="ARS">ARS</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mes</InputLabel>
                <Select
                  value={mesInput}
                  label="Mes"
                  onChange={(e) => setMesInput(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Todos los meses</em>
                  </MenuItem>
                  {meses.map((mes) => (
                    <MenuItem key={mes.valor} value={mes.valor}>
                      {mes.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Año"
                type="number"
                value={anioInput}
                onChange={(e) => setAnioInput(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" onClick={actualizarBalance} fullWidth>
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {renderContent()}
      </Box>
    </Paper>
  );
};

export default Balance;
