import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { addWeeks, format, isSameDay, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import useWeek from "./hooks/useWeek";

type WeekPickerProps = {
  onWeekChange: (week: { start: Date; end: Date }) => void;
};

const getEndOfWeek = (start: Date) => {
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  return end;
};

const WeekPicker = ({ onWeekChange }: WeekPickerProps) => {
  const { startDate, endDate } = useWeek();
  const [currentDate, setCurrentDate] = useState(startDate);
  const [currentEndDate, setCurrentEndDate] = useState(endDate);
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);

  useEffect(() => {
    setIsCurrentWeek(isSameDay(currentDate, startDate));
  }, [currentDate, startDate]);

  const updateWeek = (newStart: Date) => {
    const newEnd = getEndOfWeek(newStart);
    setCurrentDate(newStart);
    setCurrentEndDate(newEnd);
    onWeekChange({ start: newStart, end: newEnd });
  };

  const goToPrevWeek = () => updateWeek(subWeeks(currentDate, 1));
  const goToNextWeek = () => updateWeek(addWeeks(currentDate, 1));
  const goToCurrentWeek = () => updateWeek(startDate);

  const formatDateRange = () => {
    const sameMonth = currentDate.getMonth() === currentEndDate.getMonth();
    const sameYear =
      currentDate.getFullYear() === currentEndDate.getFullYear();
    const startFmt = sameMonth
      ? format(currentDate, "d", { locale: es })
      : format(currentDate, "d 'de' MMM", { locale: es });
    const endFmt = sameYear
      ? format(currentEndDate, "d 'de' MMM yyyy", { locale: es })
      : format(currentEndDate, "d 'de' MMM yyyy", { locale: es });
    return `${startFmt} – ${endFmt}`;
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1}
      sx={{ mb: 2 }}
    >
      {!isCurrentWeek && (
        <Tooltip title="Volver a esta semana">
          <Button
            onClick={goToCurrentWeek}
            size="small"
            startIcon={<Today fontSize="small" />}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Hoy
          </Button>
        </Tooltip>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Tooltip title="Semana anterior">
          <IconButton onClick={goToPrevWeek} size="small">
            <ChevronLeft />
          </IconButton>
        </Tooltip>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: 1.5, minWidth: 220, justifyContent: "center" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {formatDateRange()}
          </Typography>
          {isCurrentWeek && (
            <Chip
              label="Esta semana"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Stack>

        <Tooltip title={isCurrentWeek ? "No hay semanas futuras" : "Semana siguiente"}>
          <span>
            <IconButton
              onClick={goToNextWeek}
              disabled={isCurrentWeek}
              size="small"
            >
              <ChevronRight />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default WeekPicker;
