"use client";

import PagoVentaForm from "@/sections/ingresos-ventas/PagoVentaForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Card, CardContent, CardHeader } from "@mui/material";
import Link from "next/link";

const NuevoPagoVentaPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard/ingresos-ventas"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Volver al listado
        </Button>
      </Box>
      <Card>
        <CardHeader
          title="Registrar Pago de Venta"
          subheader="Buscá la venta y completá los datos del pago"
          sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}
        />
        <CardContent sx={{ px: { xs: 3, md: 4 }, pb: 4 }}>
          <PagoVentaForm mode="create" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoPagoVentaPage;
