"use client";

import { Grid, Paper, useTheme } from "@mui/material";
import { isSameDay } from "date-fns";
import { useCalendarContext } from "./contexts/CalendarContext";

type Props = {
  day: Date;
  children: React.ReactNode;
};

function CalendarioCellContainer({ day, children }: Props) {
  const { isFeriado } = useCalendarContext();
  const theme = useTheme();
  const isToday = isSameDay(day, new Date());
  const esFeriado = isFeriado(day);
  return (
    <Grid
      item
      xs={12 / 7}
      sm={12 / 7}
      md={12 / 7}
      key={day.toISOString()}
      sx={{
        minWidth: { xs: "auto", sm: "120px" },
        px: 0.5,
      }}
    >
      <Paper
        sx={{
          p: 1,
          height: { xs: 120, sm: 140, md: 160 },
          overflow: "auto",
          position: "relative",
          border: isToday ? `2px solid ${theme.palette.primary.main}` : "none",
          bgcolor: esFeriado ? "#FAA0A0" : "white",
        }}
      >
        {children}
      </Paper>
    </Grid>
  );
}

export default CalendarioCellContainer;
