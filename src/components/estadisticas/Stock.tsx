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
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState([]);

  const obtenerEstadisticas = useCallback(async () => {
    const url = new URL("/api/estadisticas/stock", window.location.origin);
    if (mes) url.searchParams.append("mes", mes);
    if (anio) url.searchParams.append("año", anio);
    url.searchParams.append("limite", "5");

    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      setDatos(datos);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  }, [mes, anio]);

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
      labels: datos.map(
        (stock: { nombre: string; marca: string }) =>
          `${stock.nombre} (${stock.marca})`
      ),
      datasets: [
        {
          label: "Ganancia Total",
          data: datos.map(
            (stock: { gananciaTotal: number }) => stock.gananciaTotal
          ),
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
  }, [datos]);

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
      {datos.length > 0 ? (
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
