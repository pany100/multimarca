"use client";

import {
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";
import { useMenuUIContext } from "./contexts/MenuUIContext";
import { RecordatorioAgenda } from "./hooks/useRecordatorios";

type Props = {
  day: Date;
};

function CalendarioCellReminder({ day }: Props) {
  const { getRecordatoriosForDay, updateRecordatorio } = useCalendarContext();
  const { setCurrentRecordatorio } = useAgendaUIContext();
  const dayRecordatorios = getRecordatoriosForDay(day);
  const { setMenuAnchorEl } = useMenuUIContext();

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    recordatorio: RecordatorioAgenda
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentRecordatorio(recordatorio);
  };

  const handleToggleHecho = async (recordatorio: RecordatorioAgenda) => {
    await updateRecordatorio({
      ...recordatorio,
      hecho: !recordatorio.hecho,
    });
  };

  return (
    <Box
      sx={{
        overflowY: "auto",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {/* Mostrar recordatorios del día */}
      {dayRecordatorios.map((recordatorio) => (
        <Box
          key={recordatorio.id}
          sx={{
            p: 0.5,
            bgcolor: recordatorio.hecho
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(33, 150, 243, 0.1)",
            borderRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexGrow: 1,
              width: "calc(100% - 40px)",
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleToggleHecho(recordatorio)}
              sx={{ mr: 0.1, mt: 0 }}
            >
              {recordatorio.hecho ? (
                <CheckCircleIcon fontSize="small" color="success" />
              ) : (
                <RadioButtonUncheckedIcon fontSize="small" color="primary" />
              )}
            </IconButton>

            <Tooltip
              title={recordatorio.descripcion || "Sin descripción"}
              arrow
              placement="top"
            >
              <Typography
                variant="caption"
                sx={{
                  flexGrow: 1,
                  overflow: "visible",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  textDecoration: recordatorio.hecho ? "line-through" : "none",
                  cursor: "default",
                }}
              >
                {recordatorio.titulo}
              </Typography>
            </Tooltip>
          </Box>

          <IconButton
            size="small"
            onClick={(event) => handleMenuOpen(event, recordatorio)}
            sx={{ alignSelf: "flex-start" }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}

export default CalendarioCellReminder;
