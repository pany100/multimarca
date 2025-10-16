import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { TareaDiaria } from "../types/TareaDiaria";

interface EliminarTareaDialogProps {
  open: boolean;
  onClose: () => void;
  tarea: TareaDiaria | null;
  onEliminar: (id: number) => Promise<void>;
}

const EliminarTareaDialog = ({
  open,
  onClose,
  tarea,
  onEliminar,
}: EliminarTareaDialogProps) => {
  const handleEliminar = async () => {
    if (tarea) {
      await onEliminar(tarea.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Eliminar Tarea</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que deseas eliminar esta tarea?
        </Typography>
        {tarea && (
          <Typography sx={{ mt: 1, fontStyle: "italic" }}>
            &quot;{tarea.descripcion}&quot;
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleEliminar} variant="contained" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EliminarTareaDialog;
