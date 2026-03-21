"use client";

import { Box, Typography } from "@mui/material";
import CalendarioCellContainer from "./CalendarioCellContainer";
import CalendarioCellHeader from "./CalendarioCellHeader";
import CalendarioCellReminder from "./CalendarioCellReminder";
import { useCalendarContext } from "./contexts/CalendarContext";

/** Mismo tono que el fondo anterior de celdas feriado (solo borde ahora) */
const FERIADO_BORDE = "#FAA0A0";

type Props = {
  day: Date;
};

function CalendarioCell({ day }: Props) {
  const { isFeriado, getFeriadoDescripcion } = useCalendarContext();
  const esFeriado = isFeriado(day);
  const feriadoDescripcion = esFeriado ? getFeriadoDescripcion(day) : "";
  return (
    <CalendarioCellContainer day={day}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header with date and add button */}
        <CalendarioCellHeader day={day} />

        {/* Mostrar descripción del feriado si es un día feriado */}
        {esFeriado && (
          <Box
            sx={{
              p: 0.5,
              mb: 1,
              borderRadius: 1,
              border: `1px solid ${FERIADO_BORDE}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                overflow: "visible",
                whiteSpace: "normal",
                wordBreak: "break-word",
                cursor: "default",
              }}
            >
              {feriadoDescripcion}
            </Typography>
          </Box>
        )}

        <CalendarioCellReminder day={day} />
      </Box>
    </CalendarioCellContainer>
  );
}

export default CalendarioCell;
