import { getFormattedDateArg, getFormattedPrice } from "@/utils/fieldHelper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Link as MuiLink, Typography } from "@mui/material";
import Link from "next/link";

interface PresupuestoInfoProps {
  presupuesto: any;
  vehicleInfo: string;
}

export const PresupuestoInfo = ({
  presupuesto,
  vehicleInfo,
}: PresupuestoInfoProps) => {
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
        Presupuesto #{presupuesto.id} - {vehicleInfo}
      </Typography>
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
    </Box>
  );
};
