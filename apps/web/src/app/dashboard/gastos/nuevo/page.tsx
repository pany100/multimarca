"use client";

import GastoForm from "@/sections/gastos/GastoForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";

const NuevoGastoPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/gastos"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Nuevo Gasto"
          subheader="Cargá un gasto del taller"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          <GastoForm mode="create" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoGastoPage;
