"use client";

import { useFetch } from "@/contexts/FetchContext";
import InventoryIcon from "@mui/icons-material/Inventory";
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
import React, { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Stock = () => {
  const theme = useTheme();
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

  const opcionesBar = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: "y" as const, // Horizontal bar chart
    plugins: {
      legend: {
        display: false, // Hide the legend since we're not using multiple datasets
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: moneda,
              minimumFractionDigits: 2,
            }).format(context.parsed.x);
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: moneda,
              notation: "compact",
              compactDisplay: "short",
            }).format(value);
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const colores = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
  ];

  const bordeColores = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
  ];

  const datosGrafico = React.useMemo(() => {
    if (datos.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = Array.isArray(datos)
      ? datos.map(
          (stock: { nombre: string; marca: string }) =>
            `${stock.nombre} (${stock.marca})`
        )
      : [];

    const values = Array.isArray(datos)
      ? datos.map((stock: { gananciaTotal: number }) => stock.gananciaTotal)
      : [];

    const backgroundColors = colores.slice(0, datos.length);
    const borderColors = bordeColores.slice(0, datos.length);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [datos, moneda]);

  const renderContent = () => {
    if (cargando) {
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

    if (datos.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
        >
          <Typography color="text.secondary">Sin datos disponibles</Typography>
        </Box>
      );
    }

    return (
      <>
        <Box
          sx={{
            height: "350px",
            mb: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "900px",
              display: "grid",
              justifyContent: "center",
            }}
          >
            <Bar options={opcionesBar} data={datosGrafico} />
          </Box>
        </Box>

        {/* Table view for more detailed information */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: theme.palette.grey[100],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Producto
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    Marca
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    Cantidad Vendida
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    Ganancia Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(datos) &&
                  datos.map(
                    (
                      stock: {
                        nombre: string;
                        marca: string;
                        cantidadVendida: number;
                        gananciaTotal: number;
                      },
                      index: number
                    ) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          backgroundColor:
                            index % 2 === 0
                              ? "white"
                              : theme.palette.background.default,
                        }}
                      >
                        <td style={{ padding: "10px 16px" }}>{stock.nombre}</td>
                        <td style={{ padding: "10px 16px" }}>{stock.marca}</td>
                        <td
                          style={{ padding: "10px 16px", textAlign: "right" }}
                        >
                          {stock.cantidadVendida}
                        </td>
                        <td
                          style={{ padding: "10px 16px", textAlign: "right" }}
                        >
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: moneda,
                          }).format(stock.gananciaTotal)}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </Box>
        </Paper>
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
        <InventoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Stock más Rentable
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
              <Button
                variant="contained"
                onClick={actualizarEstadisticas}
                fullWidth
              >
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

export default Stock;
