"use client";

import { Box, Grid, Paper, Typography } from "@mui/material";
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

const data = [
  { name: "Ene", ventas: 4000, reparaciones: 2400 },
  { name: "Feb", ventas: 3000, reparaciones: 1398 },
  { name: "Mar", ventas: 2000, reparaciones: 9800 },
  { name: "Abr", ventas: 2780, reparaciones: 3908 },
  { name: "May", ventas: 1890, reparaciones: 4800 },
  { name: "Jun", ventas: 2390, reparaciones: 3800 },
];

const EstadisticasPage = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Estadísticas Generales
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Typography variant="h6" gutterBottom component="div">
              Ventas vs Reparaciones
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#8884d8" />
                <Bar dataKey="reparaciones" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
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
