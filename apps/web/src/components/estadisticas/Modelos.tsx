"use client";

import { useFetch } from "@/contexts/FetchContext";
import useMarcas from "@/hooks/estadisticas/useMarcas";
import BuildIcon from "@mui/icons-material/Build";
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
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import React, { useCallback, useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

interface ModeloData {
  modelo: string;
  cantidad: number;
  porcentaje: number;
  valorVisual?: number;
}

const MARCA_DEFAULT = "PEUGEOT";

const Modelos = () => {
  const theme = useTheme();
  const { marcas, loading: loadingMarcas } = useMarcas();
  const [marcaInput, setMarcaInput] = useState("");
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [marca, setMarca] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState<ModeloData[]>([]);
  const [cargando, setCargando] = useState(true);
  const { authFetch } = useFetch();

  // Al cargar las marcas, seleccionar PEUGEOT por defecto si existe
  useEffect(() => {
    if (marcas.length === 0) return;
    const preferido = marcas.find(
      (m) => m.toUpperCase() === MARCA_DEFAULT.toUpperCase()
    );
    const valorDefault = preferido ?? marcas[0];
    setMarcaInput((prev) => (prev === "" ? valorDefault : prev));
    setMarca((prev) => (prev === "" ? valorDefault : prev));
  }, [marcas]);

  const obtenerEstadisticas = useCallback(async () => {
    if (!marca?.trim()) return;
    setCargando(true);
    const url = new URL("/api/estadisticas/modelos", window.location.origin);
    url.searchParams.set("marca", marca);
    if (mes) url.searchParams.append("mes", mes);
    if (anio) url.searchParams.append("año", anio);

    try {
      const respuesta = await authFetch(url.toString());
      const datosRecibidos = await respuesta.json();
      setDatos(datosRecibidos);
    } catch (error) {
      console.error("Error al obtener estadísticas de modelos:", error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }, [marca, mes, anio, authFetch]);

  useEffect(() => {
    if (!marca?.trim()) return;
    obtenerEstadisticas();
  }, [obtenerEstadisticas, marca]);

  const actualizarEstadisticas = () => {
    setMarca(marcaInput);
    setMes(mesInput);
    setAnio(anioInput);
    obtenerEstadisticas();
  };

  const opciones = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: { size: 12 },
        },
      },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total =
              context.chart._metasets[context.datasetIndex]?.total || 1;
            const percentage = Math.round((value * 100) / total) + "%";
            return `${label}: ${value} (${percentage})`;
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

  const colorOtros = "rgba(100, 100, 100, 0.7)";
  const bordeColorOtros = "rgba(80, 80, 80, 1)";

  const agruparModelosParaGrafico = useCallback(
    (datos: ModeloData[], maxModelos = 5) => {
      if (!Array.isArray(datos) || datos.length <= maxModelos) return datos;
      const ordenados = [...datos].sort((a, b) => b.cantidad - a.cantidad);
      const principales = ordenados.slice(0, maxModelos);
      const menorPrincipal = Math.min(
        ...principales.map((m) => m.cantidad)
      );
      const otros = ordenados.slice(maxModelos);
      const cantidadOtros = otros.reduce((sum, m) => sum + m.cantidad, 0);
      if (cantidadOtros > 0) {
        principales.push({
          modelo: "OTROS",
          cantidad: cantidadOtros,
          porcentaje: otros.reduce((s, m) => s + m.porcentaje, 0),
          valorVisual: Math.min(cantidadOtros, menorPrincipal * 0.7),
        });
      }
      return principales;
    },
    []
  );

  const datosGrafico = React.useMemo(() => {
    if (datos.length === 0) {
      return {
        labels: [] as string[],
        datasets: [
          {
            data: [] as number[],
            backgroundColor: [] as string[],
            borderColor: [] as string[],
            borderWidth: 1,
          },
        ],
      };
    }

    const agrupados = agruparModelosParaGrafico(datos);
    const reordenados = [...agrupados];
    const otrosIdx = reordenados.findIndex((d) => d.modelo === "OTROS");
    if (otrosIdx !== -1) {
      const [otrosItem] = reordenados.splice(otrosIdx, 1);
      reordenados.push(otrosItem);
    }

    const backgroundColors = reordenados.map((item, i) =>
      item.modelo === "OTROS" ? colorOtros : colores[i % colores.length]
    );
    const borderColors = reordenados.map((item, i) =>
      item.modelo === "OTROS" ? bordeColorOtros : bordeColores[i % bordeColores.length]
    );

    return {
      labels: reordenados.map((m) => m.modelo),
      datasets: [
        {
          data: reordenados.map((m) =>
            m.valorVisual !== undefined ? m.valorVisual : m.cantidad
          ),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [datos, agruparModelosParaGrafico]);

  const renderContent = () => {
    if (loadingMarcas) {
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
          <Typography color="text.secondary">
            Sin datos disponibles para la marca seleccionada
          </Typography>
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
            <Pie options={opciones} data={datosGrafico} />
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
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
                    Modelo
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    Cantidad de Atenciones
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((fila, index) => (
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
                    <td style={{ padding: "10px 16px" }}>{fila.modelo}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      {fila.cantidad}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      {Math.round(fila.porcentaje)}%
                    </td>
                  </tr>
                ))}
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
        <BuildIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Modelos más Atendidos por Marca
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
                <InputLabel>Marca</InputLabel>
                <Select
                  value={
                    marcas.length === 0
                      ? ""
                      : marcas.find(
                          (m) => m.toUpperCase() === marcaInput.toUpperCase()
                        ) ?? marcas[0]
                  }
                  label="Marca"
                  onChange={(e) => setMarcaInput(e.target.value)}
                  disabled={loadingMarcas}
                >
                  {marcas.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                  {marcas.length === 0 && !loadingMarcas && (
                    <MenuItem value="">
                      <em>Sin marcas</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
                  {meses.map((m) => (
                    <MenuItem key={m.valor} value={m.valor}>
                      {m.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Año"
                type="number"
                value={anioInput}
                onChange={(e) => setAnioInput(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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

export default Modelos;
