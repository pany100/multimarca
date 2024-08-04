"use client";

import { useFetch } from "@/contexts/FetchContext";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
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
        height="300px"
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
        height="300px"
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
      },
      {
        label: "Gastos",
        data: [balanceData.gastos],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Balance (${balanceData.moneda})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl sx={{ mr: 2, minWidth: 120 }}>
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
        <FormControl sx={{ mr: 2, minWidth: 120 }}>
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
        <TextField
          label="Año"
          type="number"
          value={anioInput}
          onChange={(e) => setAnioInput(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={actualizarBalance}>
          Actualizar
        </Button>
      </Box>
      <Bar data={chartData} options={options} />
      <Typography variant="h6" align="center" mt={2}>
        Balance: {balanceData.balance.toFixed(2)} {balanceData.moneda}
      </Typography>
    </Box>
  );
};

export default Balance;
