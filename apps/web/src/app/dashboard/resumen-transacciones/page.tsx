"use client";

import ResumenTransaccionesTable from "@/sections/resumen-transacciones/ResumenTransaccionesTable";
import { Box, Typography } from "@mui/material";
import { useState } from "react";

function ResumenTransaccionesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Resumen de Transacciones
      </Typography>

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
