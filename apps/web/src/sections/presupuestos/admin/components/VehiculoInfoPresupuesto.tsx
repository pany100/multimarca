"use client";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Box, Chip, Typography } from "@mui/material";

interface VehiculoInfoPresupuestoProps {
  vehiculo?: {
    brand: string;
    model: string;
    patent: string;
    year?: number;
    color?: string;
  } | null;
  informacionAuto?: string | null;
}

export const VehiculoInfoPresupuesto = ({
  vehiculo,
  informacionAuto,
}: VehiculoInfoPresupuestoProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Vehículo
      </Typography>

      {vehiculo ? (
        <>
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
                {vehiculo.brand} {vehiculo.model}
              </Typography>
            </Box>
            <Chip
              label={vehiculo.patent}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: "action.hover",
              }}
            />
          </Box>

          {/* Año y Color */}
          {(vehiculo.year || vehiculo.color) && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4, mb: 2 }}
            >
              {vehiculo.year} · {vehiculo.color}
            </Typography>
          )}
        </>
      ) : informacionAuto ? (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DirectionsCarIcon
            sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
          />
          <Typography variant="body2">{informacionAuto}</Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No ingresado
        </Typography>
      )}
    </>
  );
};
