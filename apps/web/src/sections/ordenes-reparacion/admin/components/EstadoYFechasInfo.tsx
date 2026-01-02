"use client";

import { getFormattedDateArg } from "@/utils/fieldHelper";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Chip, Typography } from "@mui/material";
import { getEstadoColor, getEstadoLabel } from "../helpers/estadoHelpers";

interface EstadoYFechasInfoProps {
  estado: string;
  fechaEntradaReparacion?: Date | string | null;
  fechaSalidaReparacion?: Date | string | null;
}

export const EstadoYFechasInfo = ({
  estado,
  fechaEntradaReparacion,
  fechaSalidaReparacion,
}: EstadoYFechasInfoProps) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
      >
        Estado y Fechas
      </Typography>

      {/* Estado */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FlagIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Estado:
        </Typography>
        <Chip
          label={getEstadoLabel(estado)}
          color={getEstadoColor(estado)}
          size="small"
        />
      </Box>

      {/* Fecha de Entrada a Reparación */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventAvailableIcon
          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Entrada:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getFormattedDateArg(fechaEntradaReparacion)}
        </Typography>
      </Box>

      {/* Fecha de Salida de Reparación */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventBusyIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Salida:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getFormattedDateArg(fechaSalidaReparacion)}
        </Typography>
      </Box>
    </>
  );
};
