"use client";

import { Box, Button, CircularProgress } from "@mui/material";
import useExportarTurnos from "./hooks/useExportarTurnos";

function TurnosExtraContent({
  setRefreshTrigger,
}: {
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { exportarSemana, isLoading } = useExportarTurnos();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        onClick={() => exportarSemana(false)}
        disabled={isLoading}
        startIcon={
          isLoading ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {isLoading ? "Generando PDF..." : "Exportar semana actual"}
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => exportarSemana(true)}
        disabled={isLoading}
        startIcon={
          isLoading ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {isLoading ? "Generando PDF..." : "Exportar próxima semana"}
      </Button>
    </Box>
  );
}

export default TurnosExtraContent;
