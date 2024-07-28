"use client";

import { Box, Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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

const EstadisticasPage = () => {
  const [clientesGastos, setClientesGastos] = useState([]);
  const [moneda, setMoneda] = useState("ARS");

  useEffect(() => {
    const fetchClientesGastos = async () => {
      try {
        const response = await fetch(
          "/api/estadisticas/clientes-gastos?limit=5"
        );
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const data = await response.json();
        setClientesGastos(data);
      } catch (error) {
        console.error("Error al cargar los datos de clientes y gastos:", error);
      }
    };

    fetchClientesGastos();
  }, []);

  const handleMonedaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMoneda(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Estadísticas Generales
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="div">
                Clientes que más gastaron en ventas
              </Typography>
              <select value={moneda} onChange={handleMonedaChange}>
                <option value="ARS">Pesos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </Box>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientesGastos}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombreCliente" type="category" width={150} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey={moneda === "ARS" ? "gastoTotalARS" : "gastoTotalUSD"}
                  fill={moneda === "USD" ? "#006400" : "#8884d8"}
                  name={`Gasto Total (${moneda})`}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 400 }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Estadísticas Adicionales
            </Typography>
            <Typography variant="body1">
              Aquí se mostrarán más estadísticas en el futuro.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EstadisticasPage;
