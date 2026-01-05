"use client";

import {
  getEstadoPresupuestoColor,
  getEstadoPresupuestoLabel,
} from "@/sections/ordenes-reparacion/admin/helpers/estadoHelpers";
import { getFormattedDateArg } from "@/utils/fieldHelper";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FlagIcon from "@mui/icons-material/Flag";
import { Box, Chip, Typography } from "@mui/material";

interface EstadoYFechasInfoPresupuestoProps {
  estado: string;
  fechaEnvio?: Date | string | null;
  fechaRespuesta?: Date | string | null;
}

export const EstadoYFechasInfoPresupuesto = ({
  estado,
  fechaEnvio,
  fechaRespuesta,
}: EstadoYFechasInfoPresupuestoProps) => {
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
          label={getEstadoPresupuestoLabel(estado)}
          color={getEstadoPresupuestoColor(estado)}
          size="small"
        />
      </Box>

      {/* Fecha de Envío */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventAvailableIcon
          sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Envío:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getFormattedDateArg(fechaEnvio)}
        </Typography>
      </Box>

      {/* Fecha de Respuesta */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <EventBusyIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
          Respuesta:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getFormattedDateArg(fechaRespuesta)}
        </Typography>
      </Box>
    </>
  );
};
