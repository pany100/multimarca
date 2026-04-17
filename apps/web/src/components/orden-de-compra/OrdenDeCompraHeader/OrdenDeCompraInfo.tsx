import { getFormattedDate } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

interface OrdenDeCompraInfoProps {
  orden: any;
  isSticky?: boolean;
}

export const OrdenDeCompraInfo = ({
  orden,
  isSticky = false,
}: OrdenDeCompraInfoProps) => {
  const proveedorName = orden.proveedor?.name || "Sin proveedor";
  const precioTotal = Number(orden.precioTotal) || 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: isSticky ? "center" : "flex-start",
        gap: isSticky ? 2 : 0,
        flexDirection: isSticky ? "row" : "column",
      }}
    >
      <Typography
        variant={isSticky ? "h6" : "h4"}
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: isSticky ? "1rem" : { xs: "1.5rem", md: "2rem" },
          whiteSpace: isSticky ? "nowrap" : "normal",
        }}
      >
        Orden de Compra #{orden.id} - {proveedorName}
      </Typography>

      {!isSticky && (
        <>
          <Typography variant="body2" color="text.secondary">
            Fecha: {getFormattedDate(orden.fecha)}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Total:{" "}
              <Typography component="span" fontWeight="bold" color="primary">
                $
                {precioTotal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Typography>
          </Box>
          <Link href="/dashboard/orden-de-compra" passHref legacyBehavior>
            <MuiLink
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.875rem",
                mt: 0.5,
                textDecoration: "none",
                color: "primary.main",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              Volver a Órdenes de Compra
            </MuiLink>
          </Link>
        </>
      )}

      {isSticky && (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ display: "flex", gap: 0.5 }}
          >
            Total:{" "}
            <Typography component="span" fontWeight="bold" variant="body2">
              $
              {precioTotal.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
};
