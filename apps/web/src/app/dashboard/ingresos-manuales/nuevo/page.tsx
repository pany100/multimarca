"use client";

import NuevoIngresoManualForm from "@/sections/ingresos-manuales/NuevoIngresoManualForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";

const NuevoIngresoManualPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/ingresos-manuales"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Nuevo Ingreso Manual"
          subheader="Cargá un ingreso de dinero que no proviene de una orden o venta"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          <NuevoIngresoManualForm />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoIngresoManualPage;
