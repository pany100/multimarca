"use client";

import { useFetch } from "@/contexts/FetchContext";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
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

interface MarcaData {
  marca: string;
  cantidad: number;
  valorVisual?: number;
}

const Marcas = () => {
  const theme = useTheme();
  const [mesInput, setMesInput] = useState("");
  const [anioInput, setAnioInput] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [datos, setDatos] = useState<MarcaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const { authFetch } = useFetch();

  const obtenerEstadisticas = useCallback(async () => {
    setCargando(true);
    const url = new URL("/api/estadisticas/autos", window.location.origin);
    if (mes) url.searchParams.append("mes", mes);
    if (anio) url.searchParams.append("año", anio);

    try {
      const respuesta = await authFetch(url.toString());
      const datosRecibidos = await respuesta.json();
      setDatos(datosRecibidos);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }, [mes, anio, authFetch]);

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
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.label || "";
            let value = context.raw || 0;
            let total = context.chart._metasets[context.datasetIndex].total;
            let percentage = Math.round((value * 100) / total) + "%";

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

  // Color específico para la categoría "Otros" - un gris más oscuro y distinto
  const colorOtros = "rgba(100, 100, 100, 0.7)";
  const bordeColorOtros = "rgba(80, 80, 80, 1)";

  const agruparMarcasParaGrafico = useCallback(
    (datos: MarcaData[], maxMarcas = 5) => {
      if (!Array.isArray(datos) || datos.length <= maxMarcas) {
        return datos;
      }

      const datosOrdenados = [...datos].sort((a, b) => b.cantidad - a.cantidad);

      // Encontrar la marca con menor cantidad entre las principales
      const marcasPrincipales = datosOrdenados.slice(0, maxMarcas);
      const menorCantidadPrincipal = Math.min(
        ...marcasPrincipales.map((m) => m.cantidad)
      );

      const otrosMarcas = datosOrdenados.slice(maxMarcas);
      const cantidadOtros = otrosMarcas.reduce(
        (sum, marca) => sum + marca.cantidad,
        0
      );

      if (cantidadOtros > 0) {
        // Asegurar que "Otros" sea más pequeño que la marca más pequeña de las principales
        // Usamos el 70% de la marca más pequeña para garantizar que sea visiblemente menor
        const valorVisualOtros = Math.min(
          cantidadOtros,
          menorCantidadPrincipal * 0.7
        );

        marcasPrincipales.push({
          marca: "OTROS",
          cantidad: cantidadOtros,
          valorVisual: valorVisualOtros,
        });
      }

      return marcasPrincipales;
    },
    []
  );

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

    const datosAgrupados = agruparMarcasParaGrafico(datos);

    // Asegurar que "Otros" siempre tenga el color gris y sea el último
    // Reordenar para que "Otros" siempre sea el último elemento
    const datosReordenados = [...datosAgrupados];
    const otrosIndex = datosReordenados.findIndex((d) => d.marca === "OTROS");

    if (otrosIndex !== -1) {
      const otrosItem = datosReordenados.splice(otrosIndex, 1)[0];
      datosReordenados.push(otrosItem);
    }

    const backgroundColors = datosReordenados.map((marca, index) => {
      if (marca.marca === "OTROS") {
        return colorOtros;
      }
      return colores[index % colores.length];
    });

    const borderColors = datosReordenados.map((marca, index) => {
      if (marca.marca === "OTROS") {
        return bordeColorOtros;
      }
      return bordeColores[index % bordeColores.length];
    });

    return {
      labels: datosReordenados.map((marca) => marca.marca),
      datasets: [
        {
          data: datosReordenados.map((marca) =>
            marca.valorVisual !== undefined ? marca.valorVisual : marca.cantidad
          ),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [
    datos,
    agruparMarcasParaGrafico,
    colores,
    bordeColores,
    colorOtros,
    bordeColorOtros,
  ]);

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
            <Pie options={opciones} data={datosGrafico} />
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
                    Marca
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
                {Array.isArray(datos) &&
                  datos.map((marca: MarcaData, index: number) => {
                    const total = datos.reduce(
                      (sum: number, item: MarcaData) => sum + item.cantidad,
                      0
                    );
                    const porcentaje = Math.round(
                      (marca.cantidad * 100) / total
                    );

                    return (
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
                        <td style={{ padding: "10px 16px" }}>{marca.marca}</td>
                        <td
                          style={{ padding: "10px 16px", textAlign: "right" }}
                        >
                          {marca.cantidad}
                        </td>
                        <td
                          style={{ padding: "10px 16px", textAlign: "right" }}
                        >
                          {porcentaje}%
                        </td>
                      </tr>
                    );
                  })}
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
        <DirectionsCarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        Marcas más Atendidas
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
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Año"
                type="number"
                value={anioInput}
                onChange={(e) => setAnioInput(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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

export default Marcas;
