"use client";

import NuevoIngresoVentaForm from "@/sections/ingresos-ventas/NuevoIngresoVentaForm";
import { Card, CardContent, CardHeader } from "@mui/material";

const NuevoIngresoVentaPage = () => {
  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Registrar Pago de Venta"
        subheader="Busque la venta y complete los datos del pago"
      />
      <CardContent>
        <NuevoIngresoVentaForm />
      </CardContent>
    </Card>
  );
};

export default NuevoIngresoVentaPage;
