"use client";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useOrdenDeCompraContext } from "./contexts/OrdenDeCompraContext";

const fmt = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function LineItem({
  label,
  amount,
  sign,
  color,
  sub,
}: {
  label: string;
  amount: string;
  sign?: "+" | "-";
  color?: string;
  sub?: string;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: 500,
            color: color ?? "text.secondary",
            whiteSpace: "nowrap",
          }}
        >
          {sign ? `${sign} ` : ""}$ {amount}
        </Typography>
      </Box>
      {sub && (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 1 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

const ResumenOrdenCompraSection = () => {
  const { orden } = useOrdenDeCompraContext();

  const items = orden.items || [];
  const percepcion = Number(orden.percepcion ?? 0);

  const subtotalItems = items.reduce((total: number, item: any) => {
    const precio = Number(item.precioUnitario) || 0;
    const iva = Number(item.iva) || 0;
    const precioConIva = Math.round(precio * (1 + iva / 100));
    return total + Math.round(precioConIva * Number(item.cantidad));
  }, 0);

  const total = subtotalItems + percepcion;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Resumen de la Orden
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {items.map((item: any) => {
            const precio = Number(item.precioUnitario) || 0;
            const iva = Number(item.iva) || 0;
            const precioConIva = Math.round(precio * (1 + iva / 100));
            const subtotal = Math.round(precioConIva * Number(item.cantidad));
            const nombre = item.name || item.stock?.name || "—";

            return (
              <LineItem
                key={item.id}
                label={`${nombre} (x${item.cantidad})`}
                amount={fmt(subtotal)}
                sub={
                  item.precioUnitario != null
                    ? `${fmt(precio)} c/u${iva > 0 ? ` + ${iva}% IVA` : ""}`
                    : undefined
                }
              />
            );
          })}

          {items.length > 0 && (percepcion > 0 || items.length > 1) && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <LineItem
                label="Subtotal Items"
                amount={fmt(subtotalItems)}
              />
            </>
          )}

          {percepcion > 0 && (
            <LineItem
              label="Percepción IIBB"
              amount={fmt(percepcion)}
              sign="+"
              color="success.main"
            />
          )}

          <Paper
            elevation={0}
            sx={{
              mt: 1,
              p: 1.5,
              backgroundColor: "primary.lighter",
              borderRadius: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold" color="primary.dark">
                Total
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary.dark"
                sx={{ fontFamily: "monospace" }}
              >
                $ {fmt(total)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResumenOrdenCompraSection;
