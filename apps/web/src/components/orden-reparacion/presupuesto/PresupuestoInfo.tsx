import { getFormattedDateArg, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

interface PresupuestoInfoProps {
  presupuesto: any;
  vehicleInfo: string;
  isSticky?: boolean;
}

export const PresupuestoInfo = ({
  presupuesto,
  vehicleInfo,
  isSticky = false,
}: PresupuestoInfoProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: isSticky ? "center" : "flex-start", gap: isSticky ? 2 : 0, flexDirection: isSticky ? "row" : "column" }}>
      <Typography
        variant={isSticky ? "h6" : "h4"}
        component="h1"
        sx={{
          fontWeight: 600,
          fontSize: isSticky ? "1rem" : { xs: "1.5rem", md: "2rem" },
          whiteSpace: isSticky ? "nowrap" : "normal",
        }}
      >
        Presupuesto #{presupuesto.id} - {isSticky ? (presupuesto.auto?.patent || presupuesto.informacionAuto || "N/A") : vehicleInfo}
      </Typography>

      {/* Info adicional - solo visible cuando NO es sticky */}
      {!isSticky && (
        <>
          <Typography variant="body2" color="text.secondary">
            Creado el {getFormattedDateArg(presupuesto.fecha)}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Total a pagar:{" "}
              <Typography component="span" fontWeight="bold">
                {getFormattedPrice(presupuesto.total)}
              </Typography>
            </Typography>
          </Box>
          <Link href="/dashboard/presupuestos" passHref legacyBehavior>
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
              Volver a presupuestos
            </MuiLink>
          </Link>
        </>
      )}

      {/* Info compacta - solo visible cuando ES sticky */}
      {isSticky && (
        <Typography variant="body2" fontWeight="medium" sx={{ display: "flex", gap: 0.5 }}>
          Total:{" "}
          <Typography component="span" fontWeight="bold" variant="body2">
            ${presupuesto.total?.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}
          </Typography>
        </Typography>
      )}
    </Box>
  );
};
