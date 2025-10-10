"use client";

import { Box, Typography, useTheme } from "@mui/material";
import CalendarioCellContainer from "./CalendarioCellContainer";
import CalendarioCellHeader from "./CalendarioCellHeader";
import CalendarioCellReminder from "./CalendarioCellReminder";
import { useCalendarContext } from "./contexts/CalendarContext";

type Props = {
  day: Date;
};

function CalendarioCell({ day }: Props) {
  const { isFeriado, getFeriadoDescripcion } = useCalendarContext();
  const theme = useTheme();
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
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 1,
              fontWeight: "bold",
              color: theme.palette.error.dark,
            }}
          >
            {feriadoDescripcion}
          </Typography>
        )}

        <CalendarioCellReminder day={day} />
      </Box>
    </CalendarioCellContainer>
  );
}

export default CalendarioCell;
