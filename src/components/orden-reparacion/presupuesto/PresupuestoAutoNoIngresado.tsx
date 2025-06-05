import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Box, Typography } from "@mui/material";

function PresupuestoAutoNoIngresado() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        color: "primary.light",
      }}
    >
      <DirectionsCarIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 600,
          fontSize: "1.1rem",
        }}
      >
        Vehículo no ingresado
      </Typography>
    </Box>
  );
}

export default PresupuestoAutoNoIngresado;
