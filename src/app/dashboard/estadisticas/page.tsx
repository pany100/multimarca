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

  useEffect(() => {
    const fetchClientesGastos = async () => {
      try {
        const response = await fetch(
          "/api/estadisticas/clientes-gastos?meses=1&limite=10"
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
            <Typography variant="h6" gutterBottom component="div">
              Clientes que más gastaron en el último mes
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientesGastos}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="nombreCliente"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="gastoTotal"
                  fill="#8884d8"
                  name="Gasto Total (ARS)"
                />
                <Bar
                  dataKey="gastoTotalUSD"
                  fill="#82ca9d"
                  name="Gasto Total (USD)"
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
