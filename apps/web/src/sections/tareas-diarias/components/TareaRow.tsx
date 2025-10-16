import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
} from "@mui/material";
import { TareaDiaria } from "../types/TareaDiaria";

interface TareaRowProps {
  tarea: TareaDiaria;
  index: number;
  totalTareas: number;
  currentUserId?: number;
  onCambiarEstado: (id: number, realizado: boolean) => void;
  onEditar: (tarea: TareaDiaria) => void;
  onEliminar: (tarea: TareaDiaria) => void;
}

const TareaRow = ({
  tarea,
  index,
  totalTareas,
  currentUserId,
  onCambiarEstado,
  onEditar,
  onEliminar,
}: TareaRowProps) => {
  const isOwner = currentUserId === tarea.usuarioId;

  return (
    <Box key={tarea.id}>
      <ListItem
        secondaryAction={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              edge="end"
              checked={tarea.realizado}
              onChange={(e) => onCambiarEstado(tarea.id, e.target.checked)}
              disabled={!isOwner}
            />
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => onEditar(tarea)}
              disabled={!isOwner}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onEliminar(tarea)}
              disabled={!isOwner}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      >
        <ListItemText
          primary={`${tarea.usuario?.fullName} - ${tarea.descripcion}`}
          sx={{
            textDecoration: tarea.realizado ? "line-through" : "none",
            color: tarea.realizado ? "text.disabled" : "text.primary",
            marginRight: "64px",
          }}
        />
      </ListItem>
      {index < totalTareas - 1 && <Divider component="li" />}
    </Box>
  );
};

export default TareaRow;
