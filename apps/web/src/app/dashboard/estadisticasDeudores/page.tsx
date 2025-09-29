"use client";

import DateRangeSearch from "@/components/dates/DateRangeSearch";
import useFechaToRange from "@/hooks/dates/useFechaToRange";
import useDeudores from "@/hooks/deudores/useDeudores";
import { Box, Button, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

function EstadisticasDeudoresPage() {
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const theme = useTheme();
  const { from, to } = useFechaToRange(mes, anio);
  const { deudores, searchDeudores } = useDeudores();
  useEffect(() => {
    searchDeudores(from, to);
  }, [from, to, searchDeudores]);
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
            <DateRangeSearch setMes={setMes} setAnio={setAnio} />
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" onClick={() => {}} fullWidth>
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default EstadisticasDeudoresPage;
