import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useAgendaUIContext } from "./contexts/AgendaUIContext";
import useRecordatoriosHandlers from "./hooks/useRecordatoriosHandlers";

function DeleteRecordatorioModal() {
  const { isDeleteModalOpen, setIsDeleteModalOpen, loading } =
    useAgendaUIContext();
  const { handleDelete } = useRecordatoriosHandlers();

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
          onClick={handleDelete}
          disabled={loading}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteRecordatorioModal;
