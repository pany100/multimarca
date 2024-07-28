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
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reparaciones = () => {
  const [moneda, setMoneda] = useState("ARS");
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState([]);

  const obtenerEstadisticas = useCallback(async () => {
    const url = new URL(
      "/api/estadisticas/reparaciones",
      window.location.origin
    );
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
      <Box sx={{ mb: 3 }}>
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
      </Box>
      {datos.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={datos}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fullName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="totalGastos"
              fill={moneda === "USD" ? "#82ca9d" : "#8884d8"}
              name={`Gastos totales (${moneda})`}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Sin datos
        </Typography>
      )}
    </Box>
  );
};

export default Reparaciones;
