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
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useCallback, useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Stock = () => {
  const [moneda, setMoneda] = useState("ARS");
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { authFetch } = useFetch();

  const obtenerEstadisticas = useCallback(async () => {
    setCargando(true);
    const url = new URL("/api/estadisticas/stock", window.location.origin);
    url.searchParams.append("moneda", moneda);
    if (mes) url.searchParams.append("mes", mes);
    if (anio) url.searchParams.append("año", anio);
    url.searchParams.append("limite", "5");

    try {
      const respuesta = await authFetch(url.toString());
      const datos = await respuesta.json();
      setDatos(datos);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      setCargando(false);
    }
  }, [moneda, mes, anio, authFetch]);

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
        text: "Estadísticas de Stock más Rentable",
        font: {
          size: 20,
        },
      },
    },
  };

  const datosGrafico = React.useMemo(() => {
    if (datos.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Ganancia Total",
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }

    return {
      labels: Array.isArray(datos)
        ? datos.map(
            (stock: { nombre: string; marca: string }) =>
              `${stock.nombre} (${stock.marca})`
          )
        : [],
      datasets: [
        {
          label: `Ganancia Total (${moneda})`,
          data: Array.isArray(datos)
            ? datos.map(
                (stock: { gananciaTotal: number }) => stock.gananciaTotal
              )
            : [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
        },
      ],
    };
  }, [datos, moneda]);

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
        sx={{ mb: 2, mr: 2 }}
      />
      <Button
        variant="contained"
        onClick={actualizarEstadisticas}
        sx={{ mb: 2, mt: 1 }}
      >
        Actualizar
      </Button>
      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : datos.length > 0 ? (
        <Pie options={opciones} data={datosGrafico} />
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Sin datos
        </Typography>
      )}
    </Box>
  );
};

export default Stock;
