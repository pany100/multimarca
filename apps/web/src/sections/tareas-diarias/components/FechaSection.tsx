import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  IconButton,
  List,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { TareaDiaria } from "../types/TareaDiaria";
import { formatearFecha, todasTareasCompletadas } from "../utils/tareas.utils";
import TareaRow from "./TareaRow";

interface FechaSectionProps {
  fecha: string;
  tareas: TareaDiaria[];
  currentUserId?: number;
  onCambiarEstado: (id: number, realizado: boolean) => void;
  onEditarTarea: (tarea: TareaDiaria) => void;
  onEliminarTarea: (tarea: TareaDiaria) => void;
}

const FechaSection = ({
  fecha,
  tareas,
  currentUserId,
  onCambiarEstado,
  onEditarTarea,
  onEliminarTarea,
}: FechaSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-colapsar cuando todas las tareas están completadas
  useEffect(() => {
    const todasCompletadas = todasTareasCompletadas(tareas);
    setIsCollapsed(todasCompletadas);
  }, [tareas]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const fechaFormateada = formatearFecha(fecha);

  return (
    <Paper elevation={2} sx={{ mb: 3, overflow: "hidden" }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{fechaFormateada}</Typography>
        <IconButton
          onClick={toggleCollapse}
          sx={{ color: "primary.contrastText" }}
          size="small"
        >
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
        <List>
          {tareas.map((tarea, index) => (
            <TareaRow
              key={tarea.id}
              tarea={tarea}
              index={index}
              totalTareas={tareas.length}
              currentUserId={currentUserId}
              onCambiarEstado={onCambiarEstado}
              onEditar={onEditarTarea}
              onEliminar={onEliminarTarea}
            />
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default FechaSection;
