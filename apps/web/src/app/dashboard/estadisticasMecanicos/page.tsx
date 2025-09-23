"use client";

import { useFetch } from "@/contexts/FetchContext";
import BarChartIcon from "@mui/icons-material/BarChart";
import BuildIcon from "@mui/icons-material/Build";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface MecanicoGanancias {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: {
    weekStart: string;
    weekEnd: string;
    ganancia: number;
  }[];
  gananciaTotal: number;
}

interface MecanicosData {
  data: MecanicoGanancias[];
  moneda: string;
}

const EstadisticasMecanicosPage = () => {
  const theme = useTheme();
  const { authFetch } = useFetch();
  const [loading, setLoading] = useState(true);
  const [mecanicosData, setMecanicosData] = useState<MecanicosData | null>(
    null
  );
  const [moneda, setMoneda] = useState<"ARS" | "USD">("ARS");

  useEffect(() => {
    const fetchMecanicosData = async () => {
      setLoading(true);
      try {
        const response = await authFetch(
          `/api/estadisticas/mecanicos?moneda=${moneda}`
        );
        const data = await response.json();
        setMecanicosData(data);
      } catch (error) {
        console.error("Error al obtener datos de mecánicos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMecanicosData();
  }, [authFetch, moneda]);

  const handleMonedaChange = (newMoneda: "ARS" | "USD") => {
    setMoneda(newMoneda);
  };

  const formatDate = (dateString: string) => {
    // Crear la fecha en hora local para evitar problemas de zona horaria
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda === "ARS" ? "ARS" : "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!mecanicosData || mecanicosData.data.length === 0) {
      return (
        <Typography variant="h6" sx={{ textAlign: "center", my: 4 }}>
          No hay datos disponibles
        </Typography>
      );
    }

    // Obtener las fechas de las semanas (etiquetas para el eje X)
    const chartLabels =
      mecanicosData.data[0]?.gananciasSemanales.map(
        (week) => `${formatDate(week.weekStart)} - ${formatDate(week.weekEnd)}`
      ) || [];

    // Configuración común para los gráficos
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += formatCurrency(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            color: theme.palette.divider,
          },
          ticks: {
            callback: function (value: any) {
              return formatCurrency(value);
            },
          },
        },
      },
    };

    return (
      <>
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
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Comparativa de Ganancias
          </Typography>
          <Box
            sx={{
              p: 2,
              height: "400px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Line
              data={{
                labels: chartLabels,
                datasets: mecanicosData.data.map((mecanico, index) => {
                  // Colores predefinidos para las líneas
                  const colors = [
                    {
                      border: "rgba(75, 192, 192, 1)",
                      background: "rgba(75, 192, 192, 0.2)",
                    },
                    {
                      border: "rgba(54, 162, 235, 1)",
                      background: "rgba(54, 162, 235, 0.2)",
                    },
                    {
                      border: "rgba(153, 102, 255, 1)",
                      background: "rgba(153, 102, 255, 0.2)",
                    },
                    {
                      border: "rgba(255, 159, 64, 1)",
                      background: "rgba(255, 159, 64, 0.2)",
                    },
                    {
                      border: "rgba(255, 99, 132, 1)",
                      background: "rgba(255, 99, 132, 0.2)",
                    },
                    {
                      border: "rgba(255, 206, 86, 1)",
                      background: "rgba(255, 206, 86, 0.2)",
                    },
                  ];

                  // Usar colores cíclicos si hay más mecánicos que colores
                  const colorIndex = index % colors.length;

                  return {
                    label: mecanico.mecanicoNombre,
                    data: mecanico.gananciasSemanales.map(
                      (week) => week.ganancia
                    ),
                    borderColor: colors[colorIndex].border,
                    backgroundColor: colors[colorIndex].background,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                  };
                }),
              }}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {mecanicosData.data.map((mecanico) => {
            // Datos para el gráfico del mecánico
            const mecanicoChartData = {
              labels: chartLabels,
              datasets: [
                {
                  label: mecanico.mecanicoNombre,
                  data: mecanico.gananciasSemanales.map(
                    (week) => week.ganancia
                  ),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                },
              ],
            };

            return (
              <Grid item xs={12} md={6} key={mecanico.mecanicoId}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "4px",
                    overflow: "hidden",
                    height: "350px",
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
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BuildIcon
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      {mecanico.mecanicoNombre}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total: {formatCurrency(mecanico.gananciaTotal)}
                    </Typography>
                  </Typography>
                  <Box sx={{ p: 2, height: "calc(100% - 57px)" }}>
                    <Line data={mecanicoChartData} options={commonOptions} />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

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
            <TableChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Detalle Semanal por Mecánico
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Semana</TableCell>
                  {mecanicosData.data.map((mecanico) => (
                    <TableCell key={mecanico.mecanicoId} align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {mecanico.mecanicoNombre}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mecanicosData.data[0]?.gananciasSemanales.map(
                  (week, weekIndex) => (
                    <TableRow key={weekIndex}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(week.weekStart)} -{" "}
                        {formatDate(week.weekEnd)}
                      </TableCell>
                      {mecanicosData.data.map((mecanico) => (
                        <TableCell key={mecanico.mecanicoId} align="right">
                          {formatCurrency(
                            mecanico.gananciasSemanales[weekIndex].ganancia
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                )}
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  {mecanicosData.data.map((mecanico) => (
                    <TableCell
                      key={mecanico.mecanicoId}
                      align="right"
                      sx={{ fontWeight: "bold" }}
                    >
                      {formatCurrency(mecanico.gananciaTotal)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
          Estadísticas de Mecánicos (Sin incluir reparaciones compartidas)
        </Typography>
        <Box>
          <Typography
            component="span"
            sx={{
              cursor: "pointer",
              fontWeight: moneda === "ARS" ? "bold" : "normal",
              color: moneda === "ARS" ? "primary.main" : "text.secondary",
              mr: 2,
            }}
            onClick={() => handleMonedaChange("ARS")}
          >
            ARS
          </Typography>
          <Typography
            component="span"
            sx={{
              cursor: "pointer",
              fontWeight: moneda === "USD" ? "bold" : "normal",
              color: moneda === "USD" ? "primary.main" : "text.secondary",
            }}
            onClick={() => handleMonedaChange("USD")}
          >
            USD
          </Typography>
        </Box>
      </Box>

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
          <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Ganancias de Mecánicos - Últimas 10 Semanas
        </Typography>

        <Box sx={{ p: 3 }}>{renderContent()}</Box>
      </Paper>
    </Box>
  );
};

export default EstadisticasMecanicosPage;
