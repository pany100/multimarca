"use client";

import {
  Box,
  Button,
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

const Ventas = () => {
  const [moneda, setMoneda] = useState("ARS");
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState([]);

  const obtenerEstadisticas = useCallback(async () => {
    const url = new URL("/api/estadisticas/ventas", window.location.origin);
    url.searchParams.append("moneda", moneda);
    if (mes) url.searchParams.append("mes", mes);
    if (anio) url.searchParams.append("año", anio);

    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      setDatos(datos);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  }, [moneda, mes, anio]);

  useEffect(() => {
    obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  const actualizarEstadisticas = () => {
    setMes(mesInput);
    setAnio(anioInput);
    obtenerEstadisticas();
  };

  const opciones = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Estadísticas de Ventas por Cliente",
      },
    },
  };

  const datosGrafico = {
    labels: datos.map((cliente: { fullName: string }) => cliente.fullName),
    datasets: [
      {
        label: `Ventas totales (${moneda})`,
        data: datos.map(
          (cliente: { totalVentas: number }) => cliente.totalVentas
        ),
        backgroundColor:
          moneda === "USD"
            ? "rgba(85, 140, 90, 0.7)"
            : "rgba(53, 162, 235, 0.5)",
      },
    ],
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
      <FormControl fullWidth sx={{ mb: 2 }}>
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
      <FormControl sx={{ mr: 2, mb: 2, minWidth: 120 }}>
        <InputLabel>Mes</InputLabel>
        <Select
          value={mesInput}
          label="Mes"
          onChange={(e) => setMesInput(e.target.value)}
        >
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
        sx={{ mb: 2, mr: 2 }}
      />
      <Button
        variant="contained"
        onClick={actualizarEstadisticas}
        sx={{ mb: 2, mt: 1 }}
      >
        Actualizar
      </Button>
      {datos.length > 0 ? (
        <Bar options={opciones} data={datosGrafico} />
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Sin datos
        </Typography>
      )}
    </Box>
  );
};

export default Ventas;
