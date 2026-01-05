import { getFormattedDate } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

interface VentaInfoProps {
  venta: any;
}

export const VentaInfo = ({ venta }: VentaInfoProps) => {
  const clienteInfo = venta.cliente
    ? venta.cliente.fullName
    : venta.informacionCliente || "N/A";

  // Calcular deuda
  const totalAPagar = venta.total || 0;
  const totalPagado = venta.totalPagos || 0;
  const deuda = totalAPagar - totalPagado;

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        Venta #{venta.id} - {clienteInfo}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Fecha: {getFormattedDate(venta.fecha)}
      </Typography>
      <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
        <Typography variant="body1" fontWeight="medium">
          Total a pagar:{" "}
          <Typography component="span" fontWeight="bold">
            $
            {totalAPagar.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Typography>
        <Typography variant="body1" fontWeight="medium" color="error">
          Deuda:{" "}
          <Typography component="span" fontWeight="bold" color="error">
            $
            {deuda.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Typography>
      </Box>
      <Link href="/dashboard/ventas" passHref legacyBehavior>
        <MuiLink
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.875rem",
            mt: 0.5,
            textDecoration: "none",
            color: "primary.main",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Volver a ventas
        </MuiLink>
      </Link>
    </Box>
  );
};
