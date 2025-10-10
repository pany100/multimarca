import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import { useCalendarContext } from "./contexts/CalendarContext";

function DeleteRecordatorioModal() {
  const { isDeleteModalOpen, setIsDeleteModalOpen } = useAgendaUIContext();
  const { currentRecordatorio, deleteRecordatorio } = useCalendarContext();
  return (
    <Dialog
      open={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Está seguro que desea eliminar este recordatorio?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          onClick={async () =>
            currentRecordatorio && deleteRecordatorio(currentRecordatorio.id)
          }
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
