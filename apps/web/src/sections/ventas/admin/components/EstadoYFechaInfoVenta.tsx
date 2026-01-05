"use client";

import {
  getEstadoVentaColor,
  getEstadoVentaLabel,
} from "@/sections/ordenes-reparacion/admin/helpers/estadoHelpers";
import { getFormattedDateArg } from "@/utils/fieldHelper";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Chip, Typography } from "@mui/material";

interface EstadoYFechaInfoVentaProps {
  estado: string;
  fecha: Date;
}

export const EstadoYFechaInfoVenta = ({
  estado,
  fecha,
}: EstadoYFechaInfoVentaProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Estado y Fecha
      </Typography>

      {/* Estado */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FlagIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Estado:
        </Typography>
        <Chip
          label={getEstadoVentaLabel(estado)}
          color={getEstadoVentaColor(estado)}
          size="small"
        />
      </Box>

      {/* Fecha */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <CalendarMonthIcon
          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Fecha:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getFormattedDateArg(fecha)}
        </Typography>
      </Box>
    </>
  );
};
