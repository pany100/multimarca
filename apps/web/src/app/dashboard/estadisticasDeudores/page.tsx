"use client";

import MonthYearRangeSearch from "@/components/dates/MonthYearRangeSearch";
import BarGraphic from "@/components/estadisticas/BarGraphic";
import useMonthYearToRange from "@/hooks/dates/useMonthYearToRange";
import useDeudores from "@/hooks/deudores/useDeudores";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function EstadisticasDeudoresPage() {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const theme = useTheme();
  const { from, to } = useMonthYearToRange(mes, anio);
  const { deudores, searchDeudores, loading } = useDeudores();

  useEffect(() => {
    searchDeudores(from, to);
  }, [from, to, searchDeudores]);

  const items = useMemo(
    () =>
      Array.isArray(deudores)
        ? deudores.map((d) => ({
            label: d.cliente_nombre || "Cliente",
            value: d.deuda_total || 0,
          }))
        : [],
    [deudores]
  );

  const hayDatos = items.length > 0;

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
          Estadísticas de Deudores
        </Typography>
      </Box>
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
            <MonthYearRangeSearch setMes={setMes} setAnio={setAnio} />
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 2, p: 2 }}>
          {hayDatos || loading ? (
            <BarGraphic
              data={items}
              title="Deuda total por cliente"
              currency="ARS"
              height={420}
              maxWidth={1100}
              loading={loading}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <Typography color="text.secondary">
                Sin datos disponibles
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default EstadisticasDeudoresPage;
