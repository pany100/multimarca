import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { addWeeks, format, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import useWeek from "./hooks/useWeek";

type WeekPickerProps = {
  onWeekChange: (week: { start: Date; end: Date }) => void;
};

const WeekPicker = ({ onWeekChange }: WeekPickerProps) => {
  const { startDate, endDate } = useWeek();
  const [currentDate, setCurrentDate] = useState(startDate);
  const [currentEndDate, setCurrentEndDate] = useState(endDate);
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);
  useEffect(() => {
    // Comparamos solo los valores de día, mes y año para determinar si es la semana actual
    setIsCurrentWeek(
      currentDate.getDate() === startDate.getDate() &&
        currentDate.getMonth() === startDate.getMonth() &&
        currentDate.getFullYear() === startDate.getFullYear()
    );
  }, [currentDate, startDate]);

  const goToPrevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    const newEndDate = new Date(newDate);
    console.log("newDate", newDate);
    newEndDate.setDate(newDate.getDate() + 4);
    console.log("newEndDate", newEndDate);
    setCurrentDate(newDate);
    setCurrentEndDate(newEndDate);
    onWeekChange({ start: newDate, end: newEndDate });
  };

  const goToNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    const newEndDate = new Date(newDate);
    console.log("newDate", newDate);
    newEndDate.setDate(newDate.getDate() + 4);
    console.log("newEndDate", newEndDate);
    setCurrentDate(newDate);
    setCurrentEndDate(newEndDate);
    onWeekChange({ start: newDate, end: newEndDate });
  };

  const formatDateRange = () => {
    console.log("currentDate", currentDate);
    console.log("currentEndDate", currentEndDate);
    return `${format(currentDate, "d 'de' MMMM", { locale: es })} - ${format(
      currentEndDate,
      "d 'de' MMMM",
      { locale: es }
    )}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "right",
        gap: 2,
        mb: 2,
      }}
    >
      <Button onClick={goToPrevWeek} size="small">
        <ChevronLeft />
      </Button>

      <Typography variant="subtitle1">{formatDateRange()}</Typography>

      <Button onClick={goToNextWeek} disabled={isCurrentWeek} size="small">
        <ChevronRight />
      </Button>
    </Box>
  );
};

export default WeekPicker;
