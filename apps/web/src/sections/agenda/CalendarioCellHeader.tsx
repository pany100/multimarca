import { Add as AddIcon } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { format, isSameDay } from "date-fns";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";

type Props = {
  day: Date;
};

function CalendarioCellHeader({ day }: Props) {
  const { isFeriado, setCurrentRecordatorio } = useCalendarContext();
  const isToday = isSameDay(day, new Date());
  const esFeriado = isFeriado(day);
  const { setIsModalOpen, setDay } = useAgendaUIContext();

  const handleCreateRecordatorio = (day: Date) => {
    setDay(day);
    setCurrentRecordatorio(null);
    setIsModalOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: isToday ? "bold" : "normal",
        }}
      >
        {format(day, "d")}
      </Typography>

      <Tooltip
        title={esFeriado ? "No se pueden crear eventos en días feriados" : ""}
      >
        <span>
          <IconButton
            size="small"
            onClick={() => handleCreateRecordatorio(day)}
            disabled={esFeriado}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export default CalendarioCellHeader;
