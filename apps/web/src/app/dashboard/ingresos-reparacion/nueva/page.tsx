"use client";

import PagoReparacionForm from "@/sections/ingresos-reparacion/PagoReparacionForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";

const NuevoPagoReparacionPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/ingresos-reparacion"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Registrar Pago de Reparación"
          subheader="Buscá la orden de reparación y completá los datos del pago"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          <PagoReparacionForm mode="create" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoPagoReparacionPage;
