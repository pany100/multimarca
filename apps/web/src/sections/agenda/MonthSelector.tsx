"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { IconButton, Paper, Typography } from "@mui/material";
import { addMonths, format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useCalendarContext } from "./contexts/CalendarContext";

type Props = {
  currentMonth: Date;
  setCurrentMonth: (month: Date) => void;
};

function MonthSelector() {
  const { currentMonth, setCurrentMonth } = useCalendarContext();
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <IconButton onClick={goToPreviousMonth}>
        <ChevronLeftIcon />
      </IconButton>

      <Typography variant="h6">
        {format(currentMonth, "MMMM yyyy", { locale: es })}
      </Typography>

      <IconButton onClick={goToNextMonth}>
        <ChevronRightIcon />
      </IconButton>
    </Paper>
  );
}

export default MonthSelector;
