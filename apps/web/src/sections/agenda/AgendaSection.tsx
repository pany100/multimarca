"use client";

import { Box, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import Calendario from "./Calendario";
import MonthSelector from "./MonthSelector";
import { AgendaUIProvider } from "./contexts/AgendaUIContext";
import { CalendarProvider } from "./contexts/CalendarContext";

type props = {
  general?: boolean;
  title: string;
};

export default function AgendaSection({ general = true, title }: props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <CalendarProvider general={general}>
        <AgendaUIProvider>
          <Box sx={{ p: 3, width: "100%" }}>
            <Typography variant="h4" gutterBottom>
              {title}
            </Typography>
          </Box>
          <MonthSelector />
          <Calendario />
        </AgendaUIProvider>
      </CalendarProvider>
    </LocalizationProvider>
  );
}
