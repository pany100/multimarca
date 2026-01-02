"use client";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SpeedIcon from "@mui/icons-material/Speed";
import { Box, Chip, Typography } from "@mui/material";

interface VehiculoInfoProps {
  vehiculo: {
    brand?: string;
    model?: string;
    patent?: string;
    year?: number;
    color?: string;
  } | null;
  kilometros?: number | null;
}

export const VehiculoInfo = ({ vehiculo, kilometros }: VehiculoInfoProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Vehículo
      </Typography>

      {/* Marca, Modelo y Patente */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DirectionsCarIcon
            sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {vehiculo?.brand} {vehiculo?.model}
          </Typography>
        </Box>
        <Chip
          label={vehiculo?.patent || "N/A"}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: "action.hover",
          }}
        />
      </Box>

      {/* Año y Color */}
      <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
        {vehiculo?.year} · {vehiculo?.color}
      </Typography>

      {/* Kilómetros */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "action.hover",
          p: 1.5,
          borderRadius: 1,
        }}
      >
        <SpeedIcon sx={{ color: "primary.main", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {kilometros?.toLocaleString() || "0"} km
        </Typography>
      </Box>
    </>
  );
};
