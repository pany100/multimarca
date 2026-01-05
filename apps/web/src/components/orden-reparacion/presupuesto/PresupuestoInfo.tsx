import { getFormattedDateArg, getFormattedPrice } from "@/utils/fieldHelper";
import { Box, Typography } from "@mui/material";

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
    </Box>
  );
};
