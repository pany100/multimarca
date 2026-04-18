"use client";

import NuevoIngresoReparacionForm from "@/sections/ingresos-reparacion/NuevoIngresoReparacionForm";
import { Card, CardContent, CardHeader } from "@mui/material";

const NuevoIngresoReparacionPage = () => {
  return (
    <Card sx={{ padding: 3 }}>
      <CardHeader
        title="Registrar Pago de Reparacion"
        subheader="Busque la orden de reparacion y complete los datos del pago"
      />
      <CardContent>
        <NuevoIngresoReparacionForm />
      </CardContent>
    </Card>
  );
};

export default NuevoIngresoReparacionPage;
