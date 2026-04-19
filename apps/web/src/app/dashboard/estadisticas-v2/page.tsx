"use client";

import ResumenFinanciero from "@/components/estadisticas-v2/tabs/ResumenFinanciero";
import GastosBalance from "@/components/estadisticas-v2/tabs/GastosBalance";
import StockInventario from "@/components/estadisticas-v2/tabs/StockInventario";
import OperacionesClientes from "@/components/estadisticas-v2/tabs/OperacionesClientes";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";

export default function EstadisticasV2Page() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Resumen General
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Resumen Financiero" />
          <Tab label="Gastos y Balance" />
          <Tab label="Stock e Inventario" />
          <Tab label="Operaciones y Clientes" />
        </Tabs>
      </Box>

      {tab === 0 && <ResumenFinanciero />}
      {tab === 1 && <GastosBalance />}
      {tab === 2 && <StockInventario />}
      {tab === 3 && <OperacionesClientes />}
    </Box>
  );
}
