"use client";

import ResumenTransaccionesTable from "@/sections/resumen-transacciones/ResumenTransaccionesTable";
import TipoOperacionFilter from "@/sections/resumen-transacciones/TipoOperacionFilter";
import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";

function ResumenTransaccionesPage() {
  const [tipoOperacionId, setTipoOperacionId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleFilterChange = (newTipoOperacionId: string | null) => {
    setTipoOperacionId(newTipoOperacionId);
    // Trigger a refresh of the table data
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Resumen de Transacciones
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <TipoOperacionFilter onFilterChange={handleFilterChange} />
      </Paper>

      <Box>
        <ResumenTransaccionesTable
          refreshTrigger={refreshTrigger}
          setRefreshTrigger={setRefreshTrigger}
        />
      </Box>
    </Box>
  );
}

export default ResumenTransaccionesPage;
