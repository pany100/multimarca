"use client";

import { getFormattedDate } from "@/utils/fieldHelper";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useIngresoVenta } from "./contexts/IngresoVentaContext";

const InfoField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1">{children}</Typography>
  </div>
);

const IngresoVentaVentaSection = () => {
  const { ingreso } = useIngresoVenta();
  const venta = ingreso.venta;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Venta Asociada
        </Typography>

        {venta ? (
          <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
              <InfoField label="Venta">
                <Link
                  href={`/dashboard/ventas/${venta.id}/ver`}
                  style={{ textDecoration: "underline" }}
                >
                  Venta #{venta.id}
                </Link>
              </InfoField>
            </Grid>
            <Grid item xs={6} md={4}>
              <InfoField label="Fecha de Venta">
                {getFormattedDate(venta.fecha)}
              </InfoField>
            </Grid>
            <Grid item xs={6} md={4}>
              <InfoField label="Cliente">
                {ingreso.cliente?.fullName ||
                  ingreso.informacionCliente ||
                  "No especificado"}
              </InfoField>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay información de venta disponible
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default IngresoVentaVentaSection;
